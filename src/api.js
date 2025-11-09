const API_URL = process.env.REACT_APP_API_URL;

export async function getClientes() {
  const response = await fetch(`${API_URL}/api/cliente`);
  if (!response.ok) throw new Error('Erro ao buscar clientes');
  return await response.json();
}
