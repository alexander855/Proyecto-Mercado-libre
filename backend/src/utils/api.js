
export const fetchConAuth = async (url, options = {}) => {
    const token = localStorage.getItem('token');
    
    const respuesta = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
            'Authorization': `Bearer ${token}`
        }
    });

    // Si el token expiró, redirigir a login
    if (respuesta.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/Login';
        return;
    }

    return respuesta;
};