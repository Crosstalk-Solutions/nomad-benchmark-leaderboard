import router from '@adonisjs/core/services/router'
import server from '@adonisjs/core/services/server'

server.errorHandler(() => import('#exceptions/handler'))

server.use([
  () => import('@adonisjs/cors/cors_middleware'),
  () => import('@adonisjs/vite/vite_middleware'),
  () => import('@adonisjs/inertia/inertia_middleware'),
  () => import('@adonisjs/static/static_middleware'),
])

router.use([() => import('@adonisjs/core/bodyparser_middleware')])

export const middleware = router.named({
  rateLimit: () => import('#middleware/rate_limit'),
  hmacVerify: () => import('#middleware/hmac_verify'),
})
