import React, { SVGProps } from "react";

// 1. Define the props interface for type safety.
// We extend React.SVGProps<SVGSVGElement> to automatically include
// all standard SVG attributes (like 'role', 'aria-label', etc.) without
// having to list them manually. This is a best practice.
export interface LogoIconProps extends SVGProps<SVGSVGElement> {
  /**
   * Optional CSS class name for the wrapper SVG.
   */
  className?: string;

  /**
   * Color for the primary elements. Defaults to 'currentColor' for easy inheritance.
   */
  fill?: string;

  /**
   * The width and height of the icon.
   */
  size?: number | string;

  /**
   * Optional inline style object for the wrapper SVG.
   */
  style?: React.CSSProperties;
}

/**
 * A reusable, type-safe React component for the provided SVG logo icon.
 * It is designed to be highly customizable while preserving the original SVG structure.
 * * @param {LogoIconProps} props - The component props, including standard SVG attributes.
 * @returns {React.ReactElement} The rendered SVG icon.
 */
export const LogoIcon = ({
  className,
  fill = "currentColor",
  size = 48,
  style,
  ...rest
}: LogoIconProps): React.ReactElement => {
  // The original SVG had hardcoded width/height and used fill="#fff".
  // The component ensures size is set via props and allows fill color to be customized.

  const finalStyle: React.CSSProperties = {
    // We explicitly type the style object for safety
    ...style,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      width={size}
      height={size}
      className={className}
      style={finalStyle}
      // Spread the 'rest' properties (from SVGProps) onto the root element
      {...rest}
    >
      <g fill={fill} transform="translate(4 0)">
        <path d="m28.6446 39.168c-.6032 1.3404-1.353 2.6531-2.2519 3.7888 7.4581-2.5137 12.9483-9.3054 13.5527-17.4568h-2.6549c-3.2399 0-5.8424 2.5861-6.369 5.7829-.4855 2.9468-1.2621 5.6301-2.2769 7.8851z" />
        <path d="m22.7724 25.5c3.3921 0 6.167 2.8299 5.5439 6.1643-1.3533 7.2424-4.5667 12.3357-8.3155 12.3357-4.7435 0-8.6299-8.1549-8.975-18.5z" />
        <path d="m30.9904 17.1502c.4961 3.2267 3.1106 5.8498 6.3752 5.8498h2.6107c-.4123-8.3729-5.9735-15.39183-13.5836-17.95683.8989 1.13575 1.6487 2.44843 2.2519 3.78878 1.0643 2.36505 1.8666 5.20115 2.3458 8.31825z" />
        <path d="m28.4165 16.8957c.5674 3.3176-2.1954 6.1043-5.5612 6.1043h-11.8434c.2344-10.5811 4.1693-19 8.9889-19 3.8447 0 7.1263 5.35721 8.4157 12.8957z" />
        <path d="m8.51131 23c.11359-5.4083 1.14536-10.3894 2.84579-14.16805.6031-1.34035 1.3529-2.65303 2.2519-3.78878-7.61011 2.565-13.171316 9.58393-13.5836094 17.95683z" />
        <path d="m.0562286 25.5c.6043994 8.1514 6.0946514 14.9431 13.5527714 17.4568-.899-1.1357-1.6488-2.4484-2.2519-3.7888-1.6479-3.6619-2.66781-8.4531-2.83264-13.668z" />
      </g>
    </svg>
  );
};

/**
 * Props for the LogoWithText component.
 */
export interface LogoWithTextProps {
  /**
   * Optional CSS class name for the wrapper div.
   */
  className?: string;

  /**
   * Size of the logo icon. Defaults to 40.
   */
  iconSize?: number | string;

  /**
   * Color for the logo icon. Defaults to 'currentColor'.
   */
  iconFill?: string;

  /**
   * Font size for the text. Defaults to '1.5rem'.
   */
  textSize?: string;

  /**
   * Optional inline style object for the wrapper div.
   */
  style?: React.CSSProperties;
}

/**
 * A logo component that displays the LogoIcon alongside the "Vibe" text.
 * Perfect for headers, navigation bars, and branding.
 * @param {LogoWithTextProps} props - The component props.
 * @returns {React.ReactElement} The rendered logo with text.
 */
export const Logo = ({
  className = "",
  iconSize = 30,
  iconFill = "currentColor",
  textSize = "1.3rem",
  style,
}: LogoWithTextProps): React.ReactElement => {
  return (
    <div className={`flex items-center gap-3 ${className}`} style={style}>
      <LogoIcon size={iconSize} fill={iconFill} />
      <span
        style={{
          fontSize: textSize,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        Vibe
      </span>
    </div>
  );
};
