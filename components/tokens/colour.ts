"use server";

import { Token } from "@/lib/core/model/CellLike";
import colors from "tailwindcss/colors";
import sharp from "sharp";


type RGB = {
    r: number;
    g: number;
    b: number;
};

function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function colorDistance(rgb: RGB, hexColor: string): number {
    if (hexColor == null) return Infinity;
    const color2RGB = hexToRgb(hexColor);
    if (!color2RGB) {
        return Infinity;
    }

    const distance = Math.sqrt(
        (rgb.r - color2RGB.r) * (rgb.r - color2RGB.r) +
        (rgb.g - color2RGB.g) * (rgb.g - color2RGB.g) +
        (rgb.b - color2RGB.b) * (rgb.b - color2RGB.b)
    );

    return distance;
}

function closestColor(rgb: RGB, hexColors: string[]): string {
    let min = Infinity;
    // Set to RGB hex
    let closestColor: string = (rgb.r << 16 | rgb.g << 8 | rgb.b).toString(16).padStart(6, '0');
    for (let i = 0; i < hexColors.length; i++) {
        const distance = colorDistance(rgb, hexColors[i]);
        if (distance < min && distance !== Infinity) {
            min = distance;
            closestColor = hexColors[i];
        }
    }
    return closestColor;
}

export async function getColors(outputTokens: Token[]) {
    const _colors: { [key: string]: string } = {};
    for (const token of outputTokens) {
        if (token?.logoURI) {
            const file = await fetch(token?.logoURI).then((res) => res.arrayBuffer())
            const shrp = sharp(file)
            const dom = (await shrp.stats()).dominant
            const stats = (dom.r <= 8 && dom.b <= 8 && dom.g <= 8) ? await shrp
                .resize(5, 5)
                .toBuffer()
                .then(async buffer => {
                    const stats = await sharp(buffer)
                        .stats();
                    const { channels: [r, g, b] } = stats;
                    return [
                        Math.round(r.mean),
                        Math.round(g.mean),
                        Math.round(b.mean)
                    ];
                }) : [dom.r, dom.g, dom.b]

            const dominant = {
                r: stats[0],
                g: stats[1],
                b: stats[2]
            }

            const closest = closestColor(dominant, Object.values(colors).map(c => typeof c === "object" ? c[500] : null).filter(c => c !== null) as string[]);

            _colors[token.address] = closest;
        }
    }
    return _colors;
}