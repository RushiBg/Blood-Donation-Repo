import { useSnackbar as useNotistackSnackbar } from 'notistack';

export default function useSnackbar() {
  const { enqueueSnackbar } = useNotistackSnackbar();
  return enqueueSnackbar;
} 