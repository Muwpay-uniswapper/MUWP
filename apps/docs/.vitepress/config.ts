import { withMermaid } from "vitepress-plugin-mermaid";

export default withMermaid({
  title: "MUWP Docs",
  base: "/docs/",
  vite: {
    css: {
      // Prevent VitePress from inheriting the parent MUWP/ tailwind.config.js
      postcss: { plugins: [] },
    },
  },
  description: "Documentation for the MUWP cross-chain swap protocol and SDK",
  themeConfig: {
    logo: "/logo.svg",
    nav: [
      { text: "Guide", link: "/guide/introduction" },
      { text: "SDK", link: "/sdk/" },
      { text: "Stellar", link: "/stellar/" },
    ],
    sidebar: {
      "/guide/": [
        {
          text: "Getting Started",
          items: [
            { text: "Introduction", link: "/guide/introduction" },
            { text: "Architecture", link: "/guide/architecture" },
          ],
        },
      ],
      "/sdk/": [
        {
          text: "SDK",
          items: [
            { text: "Overview", link: "/sdk/" },
          ],
        },
        {
          text: "Milestone 1",
          items: [
            { text: "Core SDK", link: "/sdk/milestone-1/deliverable-1-sdk" },
            { text: "Multi-Token Swap", link: "/sdk/milestone-1/deliverable-2-swap" },
          ],
        },
        {
          text: "Architecture",
          items: [
            { text: "Stellar Architecture", link: "/sdk/architecture/stellar-architecture" },
            { text: "Technical Feasibility", link: "/sdk/architecture/technical-feasibility" },
            { text: "Glossary", link: "/sdk/architecture/glossary" },
          ],
        },
      ],
      "/stellar/": [
        {
          text: "Stellar Integration",
          items: [
            { text: "Overview", link: "/stellar/" },
          ],
        },
        {
          text: "SDK",
          items: [
            { text: "SDK Architecture", link: "/stellar/sdk-architecture" },
            { text: "SDK Technical Feasibility", link: "/stellar/sdk-feasibility" },
          ],
        },
        {
          text: "Architecture",
          items: [
            { text: "Technical Feasibility", link: "/stellar/technical-feasibility" },
            { text: "Architecture Diagram", link: "/stellar/architecture-diagram" },
            { text: "Swap Sequence", link: "/stellar/swap-sequence" },
          ],
        },
        {
          text: "Reference",
          items: [
            { text: "Glossary", link: "/stellar/glossary" },
          ],
        },
      ],
    },
    socialLinks: [
      { icon: "github", link: "https://github.com/muwpay" },
    ],
    footer: {
      message: "MUWPAY — Multi-token cross-chain swap protocol",
    },
  },
});
