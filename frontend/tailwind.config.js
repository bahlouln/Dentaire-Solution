/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
        "./node_modules/flowbite-react/lib/esm/**/*.js",
        "./node_modules/flowbite/**/*.js",
    ],
    theme: {
        extend: {
            container: {
                center: true,
                padding: { DEFAULT: "1rem", sm: "1.25rem", lg: "2rem", xl: "2.5rem", "2xl": "3rem" },
            },
        },
    },
    plugins: [
        require("@tailwindcss/forms"),
        require("flowbite/plugin"),
    ],
};
