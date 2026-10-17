import Box from "./Box"


const boxes = Array.from(
  {length :64},
  (_, index) => index
)


export default function BoxGrid({selectedBoxes, onToggle}){
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
      {
         boxes.map((id)=>(
            <Box
              key= {id}
              id={id}
              isSelected = {selectedBoxes.includes(id)}
              onToggle = {onToggle}

              />
         ))}

    </div>
  )
}