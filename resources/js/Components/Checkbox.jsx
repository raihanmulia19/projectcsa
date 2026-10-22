export default function Checkbox({ className = '', ...props }) {
    return (
        <input
            {...props}
            type="checkbox"
            className={
                'rounded border-gray-300 text-[#143d2c] shadow-sm focus:ring-[#143d2c] ' +
                className
            }
        />
    );
}
