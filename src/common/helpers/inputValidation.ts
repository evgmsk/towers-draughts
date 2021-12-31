export const validateEmail = (email: string) => {
    const isError = /^\w+@\w+\.\w{1,3}$/.test(email);
    if (!isError) {
        return {message: 'invalid e-mail, please fix it'}
    }
    return  {message: ''}
}

export const validatePassword = (password: string) => {
    const isError = /\S+[!&^%$#*]\S*/g.test(password) && (password.length >= 6)
    if (!isError) {
        return {message: 'password must contain one of !&^%$#* charters end have at least length 6'}
    }
    return {message: ''}
}

export const validateName = (name: string) => {
    const isError = /\S{6,15}/.test(name);
    if (!isError) {
        return {message: 'name must have at least 6 non space characters'}
    }
    return  {message: ''}
    
}
