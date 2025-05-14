export default defineNuxtRouteMiddleware(async (to) => {
    const {user, userProfile, fetchUserProfile} = useAuthUser()

    // Oe, here i'm defining the public routes that don't require authentication
    const publicRoutes = ['/auth/login', '/auth/register', '/auth/confirm']

    // If the route is public, we must allow access
    if (publicRoutes.includes(to.path)) {
        return
    } 
    
    // Verify if user is authenticated, if it's not, redirect to login
    if (!user.value) {
        return navigateTo('/auth/login')
    }

    // Load user profile
    if (!userProfile.value) {
        await fetchUserProfile()
    }

    // Specific route for roles
    const profesorRoutes = ['/profesor', '/profesor/dashboard']
    const alumnoRoutes = ['/alumno', '/alumno/dashboard']

    // Para que entiendan, si esta condición es true entonces el usuario intenta acceder a una ruta de profesor pero no es profesor, entonces lo redirigimos a la página de login
    if (profesorRoutes.includes(to.path) && userProfile.value?.role !== 'profesor') {
        return navigateTo('/unauthorized')
    }

    // Lo mismo que la anterior pero para el rol de alumno
    if (alumnoRoutes.includes(to.path) && userProfile.value?.role !== 'alumno') {
        return navigateTo('/unauthorized')
    }

})