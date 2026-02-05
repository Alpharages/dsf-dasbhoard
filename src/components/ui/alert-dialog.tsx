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

interface AlertDialogContentProps {
    children: React.ReactNode;
    className?: string;
}

const AlertDialogContent: React.FC<AlertDialogContentProps> = ({ children, className }) => {
    return <DialogContent className={className}>{children}</DialogContent>
}

const AlertDialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <DialogHeader>{children}</DialogHeader>
}

const AlertDialogTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <DialogTitle className={className}>{children}</DialogTitle>
}

const AlertDialogDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <DialogDescription className={className}>{children}</DialogDescription>
}

const AlertDialogFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
    return <DialogFooter className={className}>{children}</DialogFooter>
}

interface AlertDialogActionProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ children, onClick, className, disabled }) => {
    return <Button onClick={onClick} className={className} disabled={disabled}>{children}</Button>
}

interface AlertDialogCancelProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
}

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ children, onClick, className, disabled }) => {
    return <Button variant="outline" onClick={onClick} className={className} disabled={disabled}>{children}</Button>
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
