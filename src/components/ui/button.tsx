import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "underline-offset-4 hover:underline text-primary",
        gradient: "bg-gradient-to-r from-pink-500 to-orange-400 text-white shadow-lg hover:from-pink-600 hover:to-orange-500",
        glass: "backdrop-blur-lg bg-white/10 border border-white/20 hover:bg-white/20"
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
        icon: "h-10 w-10"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  loaderClassName?: string
  icon?: React.ReactNode
  iconPosition?: "left" | "right"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { 
      className, 
      variant, 
      size, 
      asChild = false, 
      loading = false,
      loaderClassName,
      icon,
      iconPosition = "left",
      children,
      ...props 
    }, 
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const showLoader = loading && !asChild
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          `${loading ? 'pointer-events-none opacity-75' : ''} ${iconPosition === "right" ? 'flex-row-reverse' : ''}`
        )}
        ref={ref}
        {...props}
      >
        {showLoader && (
          <Loader2 className={cn(
            "animate-spin",
            loaderClassName || "",
            children ? "mr-2 h-4 w-4" : "h-5 w-5"
          )} />
        )}
        
        {!showLoader && icon && (
          <span className={cn(
            children && iconPosition === "left" ? "mr-2" : "",
            children && iconPosition === "right" ? "ml-2" : ""
          )}>
            {icon}
          </span>
        )}
        
        {children}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }




