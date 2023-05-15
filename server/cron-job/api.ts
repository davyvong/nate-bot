class CronJobAPI {
  public static async getCronList(): Promise<CronJobListResponse> {
    const response = await fetch('https://api.cron-job.org/jobs', {
      headers: {
        Authorization: 'Bearer ' + process.env.CRON_JOB_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  }

  public static async getCronDetails(jobId: string): Promise<CronJobDetailsResponse> {
    const response = await fetch('https://api.cron-job.org/jobs/' + jobId, {
      headers: {
        Authorization: 'Bearer ' + process.env.CRON_JOB_API_KEY,
        'Content-Type': 'application/json',
      },
      method: 'GET',
    });
    return response.json();
  }
}

export default CronJobAPI;
