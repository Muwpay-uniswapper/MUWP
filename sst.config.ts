/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "muwp",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "cloudflare",
      providers: {
        "@ediri/vultr": {
          apiKey: process.env.VULTR_API_KEY,
          version: "2.21.1",
        },
        kubernetes: "4.18.2",
        docker: "4.5.7",
      },
    };
  },
  async run() {
    // Deploy to Kubernetes using the built image
    const appName = $app.name;

    const appLabels = { app: appName };
    // Create Vultr Container Registry
    const vcr1 = new vultr.ContainerRegistry("muwp-registry", {
      name: "muwpregistry",
      plan: "start_up",
      public: true,
      region: "sjc",
    });

    // Retrieve Registry Credentials (assumed to be set via environment variables or retrieved via API)
    const registryUrl = $util.interpolate`sjc.vultrcr.com/${vcr1.name}`;

    // Build and push the Docker image to Vultr registry

    const imageName = $util.interpolate`${registryUrl}/${appName}-image`;
    const imageTag = new Date().toISOString().replace(/[:.-]/g, "");
    const fullImageName = $util.interpolate`${imageName}:${imageTag}`;
    const myImage = new docker.Image(
      `${appName}-image-docker`,
      {
        imageName: fullImageName,
        build: {
          context: process.cwd(),
        },
        // registry: {
        //   server: registryUrl,
        //   username: vcr1.rootUser.username,
        //   password: vcr1.rootUser.password,
        // },
      },
      { dependsOn: vcr1 },
    );

    // Create the Vultr Kubernetes cluster
    const k8sCluster = new vultr.Kubernetes("k8sCluster", {
      label: $app.stage === "production" ? "vke-prod" : "vke-test",
      nodePools: {
        autoScaler: true,
        label: "vke-nodepool",
        maxNodes: $app.stage === "production" ? 3 : 1,
        minNodes: 1,
        nodeQuantity: 1,
        plan: "vc2-1c-2gb",
      },
      region: "cdg",
      version: "v1.31.0+1",
    });

    const provider = new kubernetes.Provider("k8sProvider", {
      kubeconfig: k8sCluster.kubeConfig.apply((config) =>
        Buffer.from(config, "base64").toString(),
      ),
    });
    // Create Kubernetes Secret for registry credentials
    const registrySecret = new kubernetes.core.v1.Secret(
      "vultr-registry-secret",
      {
        metadata: {
          name: "vultr-registry-secret",
        },
        type: "kubernetes.io/dockerconfigjson",
        stringData: {
          ".dockerconfigjson": $util.secret(
            vcr1.rootUser.apply((rootUser) =>
              JSON.stringify({
                auths: {
                  "sjc.vultrcr.com": {
                    username: rootUser.username,
                    password: rootUser.password,
                    email: "contact@muwpay.com",
                    auth: Buffer.from(
                      `${rootUser.username}:${rootUser.password}`,
                    ).toString("base64"),
                  },
                },
              }),
            ),
          ),
        },
      },
      { provider },
    );

    const deployment = new kubernetes.apps.v1.Deployment(
      appName,
      {
        metadata: {
          labels: appLabels,
          resourceVersion: myImage.repoDigest,
          annotations: {
            // Add an annotation to force update
            "kubernetes.io/change-cause": $util.interpolate`Update to image ${fullImageName}`,
          },
        },
        spec: {
          selector: { matchLabels: appLabels },
          replicas: 1,
          strategy: {
            type: "RollingUpdate",
            rollingUpdate: {
              maxSurge: 1,
              maxUnavailable: 0,
            },
          },
          template: {
            metadata: {
              labels: appLabels,
              annotations: {
                // Add a unique annotation to force update
                "muwp.com/image-updated": new Date().toISOString(),
              },
            },
            spec: {
              containers: [
                {
                  name: appName,
                  image: fullImageName,
                  imagePullPolicy: "Always", // Always pull the image
                },
              ],
              imagePullSecrets: [
                {
                  name: registrySecret.metadata.name,
                },
              ],
            },
          },
        },
      },
      {
        dependsOn: [myImage, registrySecret],
        provider,
      },
    );

    // Service
    const service = new kubernetes.core.v1.Service(
      `${appName}-service`,
      {
        metadata: { labels: appLabels },
        spec: {
          type: "LoadBalancer", // This will create an external IP
          ports: [{ port: 80, targetPort: 3000 }], // Adjust the ports as needed
          selector: appLabels,
        },
      },
      { provider },
    );

    // Deploy Kubernetes Dashboard
    const dashboardNamespace = new kubernetes.core.v1.Namespace("kubernetes-dashboard", {
      metadata: {
        name: "kubernetes-dashboard"
      }
    }, { provider });

    // Create Dashboard deployment using the official image
    const dashboardDeployment = new kubernetes.yaml.ConfigFile("kubernetes-dashboard", {
      file: "https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml"
    }, { provider });

    // Create admin user for dashboard access
    const adminUser = new kubernetes.core.v1.ServiceAccount("admin-user", {
      metadata: {
        name: "admin-user",
        namespace: "kubernetes-dashboard"
      }
    }, { provider, dependsOn: dashboardNamespace });

    // Create cluster role binding for the admin user
    const adminBinding = new kubernetes.rbac.v1.ClusterRoleBinding("admin-user", {
      metadata: {
        name: "admin-user"
      },
      roleRef: {
        apiGroup: "rbac.authorization.k8s.io",
        kind: "ClusterRole",
        name: "cluster-admin"
      },
      subjects: [{
        kind: "ServiceAccount",
        name: "admin-user",
        namespace: "kubernetes-dashboard"
      }]
    }, { provider, dependsOn: adminUser });

    // Generate bearer token for dashboard access
    adminUser.metadata.name.apply(async (name) => {
      const token = new kubernetes.core.v1.Secret("admin-user-token", {
        metadata: {
          name: "admin-user-token",
          namespace: "kubernetes-dashboard",
          annotations: {
            "kubernetes.io/service-account.name": name
          }
        },
        type: "kubernetes.io/service-account-token"
      }, { provider });

      // Output the commands to access dashboard
      token.metadata.name.apply((tokenName) => {
        console.log("\n=== Kubernetes Dashboard Access Instructions ===");
        console.log("1. Run: kubectl proxy");
        console.log("2. Access dashboard at: http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/");
        console.log("3. Get token by running:");
        console.log(`   kubectl -n kubernetes-dashboard get secret ${tokenName} -o jsonpath="{.data.token}" | base64 --decode\n`);
      });
    });

    const externalIp = service.status.loadBalancer.ingress[0].ip;

    // Output the IP
    externalIp.apply((ip) => {
      console.log(`Service is available at: http://${ip}`);
    });

    return {
      id: deployment.id
    }
  },
});
