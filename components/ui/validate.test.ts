import { describe, expect, test } from "bun:test";

describe("components/ui/slider:validate", () => {
    test('validate', () => {
        const props = { value: [33, 66] };

        const validate = (newAmount: number, i: number) => {
            // Expand
            const values = props.value.map((a, i, arr) => a - (arr[i - 1] ?? 0));
            values.push(100 - values.reduce((a, b) => a + b, 0));

            const delta = newAmount - values[i];
            const totalReadjustment = values.reduce((a, b, j) => i != j ? a + b : a, 0)
            const readjustment = (totalReadjustment - delta) / totalReadjustment;

            for (let j = 0; j < values.length; j++) {
                if (i != j) {
                    values[j] = Math.round(values[j] * readjustment);
                }
            }

            values[i] = newAmount;

            // Collapse
            for (let j = 1; j < values.length; j++) {
                values[j] += values[j - 1];
            }

            // Remove last element
            values.pop();

            props.value = values;
        }

        validate(50, 2);
        expect(props.value).toEqual([25, 50]);
    });
})