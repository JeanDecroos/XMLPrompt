import { logger } from '../utils/logger.js'
import { database } from '../config/database.js'

// Scheduled jobs management
let scheduledJobs = new Map()
let isRunning = false

export async function startScheduledJobs() {
  if (isRunning) {
    logger.warn('Scheduled jobs are already running')
    return
  }

  try {
    logger.info('Starting scheduled jobs...')
    isRunning = true

    // Schedule different types of jobs
    scheduleJob('cleanup-expired-shares', cleanupExpiredShares, 60 * 60 * 1000) // Every hour
    scheduleJob('update-analytics', updateAnalytics, 24 * 60 * 60 * 1000) // Daily
    scheduleJob('health-check', performHealthCheck, 5 * 60 * 1000) // Every 5 minutes

    logger.info('Scheduled jobs started successfully')
  } catch (error) {
    logger.error('Failed to start scheduled jobs:', error)
    isRunning = false
  }
}

export async function stopScheduledJobs() {
  try {
    logger.info('Stopping scheduled jobs...')
    
    // Clear all intervals
    for (const [name, jobData] of scheduledJobs) {
      if (jobData.intervalId) {
        clearInterval(jobData.intervalId)
      }
    }
    
    scheduledJobs.clear()
    isRunning = false
    
    logger.info('Scheduled jobs stopped successfully')
  } catch (error) {
    logger.error('Error stopping scheduled jobs:', error)
  }
}

function scheduleJob(name, jobFunction, intervalMs) {
  try {
    const intervalId = setInterval(async () => {
      try {
        logger.debug(`Running scheduled job: ${name}`)
        await jobFunction()
      } catch (error) {
        logger.error(`Error in scheduled job ${name}:`, error)
      }
    }, intervalMs)

    scheduledJobs.set(name, {
      name,
      intervalId,
      intervalMs,
      lastRun: null,
      nextRun: new Date(Date.now() + intervalMs)
    })

    logger.info(`Scheduled job registered: ${name} (every ${intervalMs}ms)`)
  } catch (error) {
    logger.error(`Failed to schedule job ${name}:`, error)
  }
}

// Scheduled job functions
async function cleanupExpiredShares() {
  try {
    const now = new Date().toISOString()
    
    const { data, error } = await database
      .from('shared_prompts')
      .update({ is_active: false })
      .lt('expires_at', now)
      .eq('is_active', true)
      .select('id')

    if (error) {
      throw error
    }

    if (data && data.length > 0) {
      logger.info(`Cleaned up ${data.length} expired shared prompts`)
    }

    // Update job last run time
    const job = scheduledJobs.get('cleanup-expired-shares')
    if (job) {
      job.lastRun = new Date()
      job.nextRun = new Date(Date.now() + job.intervalMs)
    }
  } catch (error) {
    logger.error('Error in cleanup expired shares job:', error)
  }
}

async function updateAnalytics() {
  try {
    // This would typically update aggregated analytics tables
    // For now, just log that it ran
    logger.info('Analytics update job completed')

    const job = scheduledJobs.get('update-analytics')
    if (job) {
      job.lastRun = new Date()
      job.nextRun = new Date(Date.now() + job.intervalMs)
    }
  } catch (error) {
    logger.error('Error in update analytics job:', error)
  }
}

async function performHealthCheck() {
  try {
    // Check database connectivity
    const { data, error } = await database
      .from('users')
      .select('count', { count: 'exact', head: true })

    if (error) {
      logger.warn('Database health check failed:', error)
    } else {
      logger.debug('Database health check passed')
    }

    const job = scheduledJobs.get('health-check')
    if (job) {
      job.lastRun = new Date()
      job.nextRun = new Date(Date.now() + job.intervalMs)
    }
  } catch (error) {
    logger.error('Error in health check job:', error)
  }
}

export function getScheduledJobsStatus() {
  const status = {
    isRunning,
    totalJobs: scheduledJobs.size,
    jobs: {}
  }

  for (const [name, job] of scheduledJobs) {
    status.jobs[name] = {
      name: job.name,
      intervalMs: job.intervalMs,
      lastRun: job.lastRun,
      nextRun: job.nextRun
    }
  }

  return status
} 