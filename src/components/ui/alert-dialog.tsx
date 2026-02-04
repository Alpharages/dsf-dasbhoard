import * as React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "./dialog"
import { Button } from "./button"

interface AlertDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ open, onOpenChange, children }) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {children}
        </Dialog>
    )
}

const AlertDialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <DialogContent className={className}>{children}</DialogContent>
}

const AlertDialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <DialogHeader>{children}</DialogHeader>
}

const AlertDialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <DialogTitle>{children}</DialogTitle>
}

const AlertDialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <DialogDescription className={className}>{children}</DialogDescription>
}

const AlertDialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <DialogFooter>{children}</DialogFooter>
}

const AlertDialogAction: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className }) => {
    return <Button onClick={onClick} className={className}>{children}</Button>
}

const AlertDialogCancel: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <Button variant="outline" className={className}>{children}</Button>
}

export {
    AlertDialog,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogAction,
    AlertDialogCancel,
}
