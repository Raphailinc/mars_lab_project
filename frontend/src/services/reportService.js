const BASE_URL = '/api';

async function ensureConnection() {
  const response = await fetch(`${BASE_URL}/check-connection`);
  if (!response.ok) {
    throw new Error('Связь с базой недоступна. Попробуйте позже.');
  }
}

export const uploadFile = async (file) => {
  await ensureConnection();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/upload-file`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Не удалось загрузить файл');
  }
  const data = await response.json();
  return data.fileName;
};

export const createReport = async (report) => {
  await ensureConnection();
  const response = await fetch(`${BASE_URL}/reports`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(report),
  });

  if (!response.ok) {
    throw new Error('Не удалось отправить отчёт');
  }
  return response.json();
};

export const getReports = async () => {
  await ensureConnection();
  const response = await fetch(`${BASE_URL}/reports`);
  if (!response.ok) {
    throw new Error('Не удалось получить отчёты');
  }
  return response.json();
};
