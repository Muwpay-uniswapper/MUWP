/**
* Object that represents one step of a `Route`
*/
export class ToolDetails {
    /**
     * The tool key used for this step. E.g. `connext`
     */
    'key': string;
    /**
     * The tool name used for this step. E.g. `Connext`
     */
    'name'?: string;

    /**
     * The logo of the tool used for this step. E.g. `https://example.com/logo.png`
     */
    'logoURI'?: string;

    static readonly discriminator: string | undefined = undefined;

    static readonly attributeTypeMap: Array<{ name: string, baseName: string, type: string, format: string }> = [
        {
            "name": "key",
            "baseName": "key",
            "type": "string",
            format: ""
        },
        {
            "name": "name",
            "baseName": "name",
            "type": "string",
            format: ""
        },
        {
            "name": "logoURI",
            "baseName": "logoURI",
            "type": "string",
            format: ""
        }
    ];

    static getAttributeTypeMap() {
        return ToolDetails.attributeTypeMap;
    }

    public constructor() {
    }
}