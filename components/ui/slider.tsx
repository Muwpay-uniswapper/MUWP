"use client"

import * as React from "react"
import * as SliderPrimitive from "./primitives/Slider"
import { cn } from "@/lib/core/utils"
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip"

function _Slider<T>(
  props: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    thumbs?: number;
    colors?: string[];
    objects?: T[];
    maps?: (arg0: T, i: number, validate?: (newAmount: number, i: number) => void, inputValue?: string, setInputValue?: (str: string) => void) => React.ReactNode;
  },
  ref: React.Ref<React.ElementRef<typeof SliderPrimitive.Root>>,
) {
  const { className, thumbs = 1, ...otherProps } = props;
  const [inputValue, setInputValue] = React.useState("0");

  if (thumbs < 1) {
    return <Tooltip>
      <TooltipTrigger asChild>
        <div className="text-black text-center rounded w-full pt-1 bg-primary">100%</div>
      </TooltipTrigger>
      <TooltipContent>
        {props.objects && props.maps?.(props.objects[0], 0)}
      </TooltipContent>
    </Tooltip>
  }

  const validate = (newAmount: number, i: number) => {
    // Expand
    const values = (props.value ?? []).map((a, i, arr) => a - (arr[i - 1] ?? 0));
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

    props.onValueChange?.(values);
  }

  return (<SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className
    )}
    {...otherProps}
  >
    <SliderPrimitive.Track className="relative h-8 w-full grow overflow-hidden rounded bg-transparent">
      {Array(thumbs + 1).fill(0).map((_, i) => <Tooltip onOpenChange={(open) => {
        open ? setInputValue(props.value && props.value.length == thumbs ? ((i < thumbs ? props.value[i] : 100) - (i > 0 ? props.value[i - 1] : 0)).toString() : i.toString()) : validate(parseInt(inputValue), i)
      }} key={i}>
        <TooltipTrigger asChild>
          <SliderPrimitive.Range
            className={`absolute text-black text-center h-full rounded pt-1 ${i == 0 ? "mr-1.5" : (i == thumbs ? "ml-1.5" : "mx-1.5")
              }`}
            style={{
              backgroundColor: props.colors && props.colors.length - 1 == thumbs ? props.colors[i] : "#fff"
            }}
            index={i}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            key={i}
          >
            {props.value && props.value.length == thumbs ? ((i < thumbs ? props.value[i] : 100) - (i > 0 ? props.value[i - 1] : 0)) : i}%
          </SliderPrimitive.Range>
        </TooltipTrigger>
        <TooltipContent className="flex flex-row gap-1 items-center">
          {props.objects && props.maps?.(props.objects[i], i, validate, inputValue, setInputValue)}
        </TooltipContent>
      </Tooltip>)}
    </SliderPrimitive.Track>
    {Array(thumbs).fill(0).map((_, i) => <SliderPrimitive.Thumb
      key={i}
      className="block h-5 w-1 rounded border-primary bg-white ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-ew-resize"
      onDoubleClick={() => {
        props.onValueChange?.(
          Array.from(Array(thumbs).keys()).map((_, i) => Math.round(100 / (thumbs + 1) * (i + 1)))
        );
      }}
    />)}
  </SliderPrimitive.Root>
  )
}
const Slider = React.forwardRef(_Slider);
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
