import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const LeaderboardController = () => import('#controllers/leaderboard_controller')
const SubmissionsController = () => import('#controllers/api/submissions_controller')

// Page routes
router.get('/', [LeaderboardController, 'home'])
router.get('/leaderboard', [LeaderboardController, 'leaderboard'])

// API routes
router
  .group(() => {
    router.post('/submit', [SubmissionsController, 'submit']).use(middleware.rateLimit())
    router.get('/leaderboard', [SubmissionsController, 'leaderboard'])
    router.get('/stats', [SubmissionsController, 'stats'])
    router.get('/submission/:id', [SubmissionsController, 'show'])
  })
  .prefix('/api/v1')

// Health check
router.get('/api/health', () => {
  return { status: 'ok' }
})
