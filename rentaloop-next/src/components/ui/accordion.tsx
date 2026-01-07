"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

interface AccordionContextValue {
    value: string | undefined;
    onValueChange: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(null);

interface AccordionItemContextValue {
    value: string;
}

const AccordionItemContext = React.createContext<AccordionItemContextValue | null>(null);

export function Accordion({
    type = "single",
    collapsible = false,
    className,
    children,
    ...props
}: {
    type?: "single" | "multiple";
    collapsible?: boolean;
    className?: string;
    children: React.ReactNode;
}) {
    const [value, setValue] = React.useState<string>("");

    const onValueChange = (newValue: string) => {
        if (value === newValue && collapsible) {
            setValue("");
        } else {
            setValue(newValue);
        }
    };

    return (
        <AccordionContext.Provider value={{ value, onValueChange }}>
            <div className={className} {...props}>
                {children}
            </div>
        </AccordionContext.Provider>
    );
}

export function AccordionItem({
    value,
    className,
    children,
    ...props
}: {
    value: string;
    className?: string;
    children: React.ReactNode;
}) {
    const context = React.useContext(AccordionContext);
    const isOpen = context?.value === value;

    return (
        <AccordionItemContext.Provider value={{ value }}>
            <div data-state={isOpen ? "open" : "closed"} className={className} {...props}>
                {children}
            </div>
        </AccordionItemContext.Provider>
    );
}

export function AccordionTrigger({
    className,
    children,
    ...props
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const itemContext = React.useContext(AccordionItemContext);
    const accordionContext = React.useContext(AccordionContext);

    if (!itemContext || !accordionContext) {
        throw new Error("AccordionTrigger must be used within AccordionItem and Accordion");
    }

    const { value } = itemContext;
    const { value: selectedValue, onValueChange } = accordionContext;
    const isOpen = selectedValue === value;

    return (
        <button
            type="button"
            onClick={() => onValueChange(value)}
            className={`flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180 ${className || ""}`}
            data-state={isOpen ? "open" : "closed"}
            {...props}
        >
            {children}
            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
        </button>
    );
}

export function AccordionContent({
    className,
    children,
    ...props
}: {
    className?: string;
    children: React.ReactNode;
}) {
    const itemContext = React.useContext(AccordionItemContext);
    const accordionContext = React.useContext(AccordionContext);

    if (!itemContext || !accordionContext) {
        return null;
    }

    const { value } = itemContext;
    const { value: selectedValue } = accordionContext;
    const isOpen = selectedValue === value;

    if (!isOpen) return null;

    return (
        <div
            className={`overflow-hidden text-sm transition-all ${className || ""}`}
            {...props}
        >
            <div className="pb-4 pt-0">{children}</div>
        </div>
    );
}
