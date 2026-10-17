export default function Box({
        id,
        isSelected,
        onToggle,
}) {
    return(
        <button
        type= "button"
        onClick= {()=>onToggle(id)}
        aria-label= {`Box ${id +1}`}
        aria-pressed = {isSelected}
        className = {
            `
             flex aspect-square w-full
             items-center justify center
             rounded-md text-xs sm:text-sm
             font-semibold cursor-pointer
             transition-colors duration-150
             focus-visible:outline-2
             focus-visible:outline-offset-2
             focus-visible:outline-blue-600
             ${
                isSelected 
                ? "border-[3px] border-blue-600 bg-blue-100 text-blue-700"
                : "border border-slate-300 bg-white text-slate-500 hover:bg-slate-50"
             }
            `}
        >
            {id +1}

        </button>
    )

}