import mongoose from "mongoose";


const gridSchema = new mongoose.Schema(
    {

        gridid:{
            type:String,
            required:true,
            unique:true
        },

        rows:{
            type:Number,
            default:8,
        },

        columns:{
            type: Number,
            default :8
        },

        selectedBoxes:{
            type :[Number],
            default :[],
            validate: {
                validator: (ids) => ids.every(id => Number.isInteger(id) && id >= 0 && id < 64) &&
                    new Set(ids).size === ids.length,
                message: "selectedBoxes must contain unique integers from 0 to 63",
            },
        },
    },
    {
        timestamps:true,
    }
);

export default mongoose.model("Grid",gridSchema);
