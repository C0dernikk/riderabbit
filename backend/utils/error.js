export const errorHandler = (statusCode,message)=>{
    const error = new Error() // Native Js Error (includes stack, name)
    error.statusCode = statusCode
    error.message = message
    return error

}