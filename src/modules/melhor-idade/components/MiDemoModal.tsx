import type { ReactNode } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface MiDemoModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function MiDemoModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    className,
}: MiDemoModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent
                className={cn(
                    "gap-0 p-0 overflow-hidden border-[#e6efe9] max-h-[92vh] overflow-y-auto",
                    "fixed left-0 right-0 bottom-0 top-auto w-full max-w-none translate-x-0 translate-y-0 rounded-t-[28px]",
                    "sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:max-w-lg sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-3xl",
                    "data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
                    "sm:data-[state=open]:slide-in-from-bottom-0 sm:data-[state=closed]:slide-out-to-bottom-0",
                    className
                )}
            >
                <div className="w-10 h-1 bg-[#d1e5dc] rounded-full mx-auto mt-3 sm:hidden" />
                <div className="p-5 sm:p-6 pt-4">
                    <DialogHeader className="text-left mb-4 pr-8">
                        <DialogTitle className="text-xl font-bold text-[#255f4f]">
                            {title}
                        </DialogTitle>
                        <DialogDescription
                            className={description ? "text-[#6b8c7d] text-sm" : "sr-only"}
                        >
                            {description || title}
                        </DialogDescription>
                    </DialogHeader>
                    {children}
                </div>
            </DialogContent>
        </Dialog>
    );
}
