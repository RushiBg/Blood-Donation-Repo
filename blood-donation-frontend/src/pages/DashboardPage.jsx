import { useEffect, useState, useRef } from 'react';
import { Typography, Box, Grid, Paper, CircularProgress, Alert, Tabs, Tab, Button, TextField, InputAdornment, Dialog, DialogTitle, DialogContent, DialogActions, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Divider, Fade, useTheme, MenuItem, Select, FormControl, InputLabel, Chip } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { Edit, Delete, Event as EventIcon, Bloodtype as BloodtypeIcon, EmojiEvents as EmojiEventsIcon, Search as SearchIcon, Download as DownloadIcon, Upload as UploadIcon, Psychology as AIIcon } from '@mui/icons-material';
import useFetch from '../hooks/useFetch';
import useApi from '../hooks/useApi';
import useSnackbar from '../hooks/useSnackbar';
import { fetchDonors, addDonor, updateDonor, deleteDonor } from '../features/donor';
import { scheduleAppointment, fetchReminders, rescheduleAppointment } from '../features/appointment';
import { createRequest } from '../features/request';
import { submitFeedback, fetchFeedback } from '../features/feedback';
import { fetchAuditLogs } from '../features/analytics';
import { fetchDonationsThisYear, fetchAllAppointments, fetchAllPayments } from '../features/analytics';
import { analyzeFeedbackSentiment } from '../features/ai';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import HealthScreeningBot from '../components/HealthScreeningBot';
import SmartMatching from '../components/SmartMatching';



function AdminAnalytics({ stats, loading, error }) {
  return (
    <>
      {loading && <CircularProgress sx={{ mt: 2 }} />}
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {stats && (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Total Users</Typography>
              <Typography variant="h4">{stats.totalUsers}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h6">Admins</Typography>
              <Typography variant="h4">{stats.admins}</Typography>
            </Paper>
          </Grid>
          {stats.totalDonors !== undefined && (
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Donors</Typography>
                <Typography variant="h4">{stats.totalDonors}</Typography>
              </Paper>
            </Grid>
          )}
          {stats.totalAppointments !== undefined && (
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Appointments</Typography>
                <Typography variant="h4">{stats.totalAppointments}</Typography>
              </Paper>
            </Grid>
          )}
          {stats.verifiedUsers !== undefined && (
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Verified Users</Typography>
                <Typography variant="h4">{stats.verifiedUsers}</Typography>
              </Paper>
            </Grid>
          )}
          {stats.donationsToday !== undefined && (
            <Grid item xs={12} sm={6} lg={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Donations Today</Typography>
                <Typography variant="h4">{stats.donationsToday}</Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </>
  );
}

function DonorTable({ refresh }) {
  const [donors, setDonors] = useState([]);
  const [donationsThisYear, setDonationsThisYear] = useState([]);
  const [addOpen, setAddOpen] = useState(false);
  const [addError, setAddError] = useState('');
  const [editOpen, setEditOpen] = useState(false);
  const [editError, setEditError] = useState('');
  const [editForm, setEditForm] = useState({});
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', bloodGroup: '', address: '', donations: 0 });
  const [search, setSearch] = useState('');
  const [importLoading, setImportLoading] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useState(null);

  const { data: donorsData, loading: donorsLoading, error: donorsError } = useFetch(fetchDonors, [refresh]);
  const [addDonorApi, { loading: addLoading }] = useApi(addDonor);
  const [updateDonorApi, { loading: updateLoading }] = useApi(updateDonor);
  const [deleteDonorApi, { loading: deleteLoading }] = useApi(deleteDonor);
  const enqueueSnackbar = useSnackbar();

  useEffect(() => {
    fetchDonationsThisYear().then(setDonationsThisYear).catch(() => setDonationsThisYear([]));
  }, [refresh]);

  useEffect(() => {
    if (!donorsData) return;
    // Merge donationsThisYear into donors
    const map = {};
    donationsThisYear.forEach(d => { map[d.donorId] = d.donationsThisYear; });
    setDonors(donorsData.map(donor => ({ ...donor, donationsThisYear: map[donor._id] || 0 })));
  }, [donorsData, donationsThisYear]);

  useEffect(() => {
    setImportError('');
    setDeleteError('');
    setEditError('');
    setAddError('');
  }, [addOpen, editOpen]);

  const handleAddOpen = () => {
    setForm({ name: '', email: '', phone: '', bloodGroup: '', address: '', donations: 0 });
    setAddError('');
    setAddOpen(true);
  };
  const handleAddClose = () => setAddOpen(false);

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleAddSubmit = async e => {
    e.preventDefault();
    try {
      await addDonorApi(form);
      enqueueSnackbar('Donor added!', { variant: 'success' });
      setAddOpen(false);
    } catch (err) {
      setAddError('Failed to add donor');
      enqueueSnackbar('Failed to add donor', { variant: 'error' });
    }
  };

  // Edit logic
  const handleEditOpen = (donor) => {
    setEditForm(donor);
    setEditError('');
    setEditOpen(true);
  };
  const handleEditClose = () => setEditOpen(false);
  const handleEditFormChange = e => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
  };
  const handleEditSubmit = async e => {
    e.preventDefault();
    try {
      await updateDonorApi(editForm._id, editForm);
      enqueueSnackbar('Donor updated!', { variant: 'success' });
      setEditOpen(false);
    } catch (err) {
      setEditError('Failed to update donor');
      enqueueSnackbar('Failed to update donor', { variant: 'error' });
    }
  };

  // Delete logic
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donor?')) return;
    setDeleteId(id);
    try {
      await deleteDonorApi(id);
      enqueueSnackbar('Donor deleted!', { variant: 'success' });
    } catch (err) {
      setDeleteError('Failed to delete donor');
      enqueueSnackbar('Failed to delete donor', { variant: 'error' });
    } finally {
      setDeleteId(null);
    }
  };

  // Export donors as CSV
  const handleExport = async () => {
    try {
      let token;
      const item = sessionStorage.getItem('token');
      if (item) {
        try {
          const { value, expiry } = JSON.parse(item);
          if (Date.now() < expiry) {
            token = value;
          } else {
            sessionStorage.removeItem('token');
          }
        } catch {
          sessionStorage.removeItem('token');
        }
      }
      const res = await fetch('/api/data/export/donors', { headers: { Authorization: token ? `Bearer ${token}` : undefined } });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'donors.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      enqueueSnackbar('Failed to export donors', { variant: 'error' });
    }
  };

  // Import donors from CSV
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportLoading(true);
    setImportError('');
    const formData = new FormData();
    formData.append('file', file);
    let token;
    const item = sessionStorage.getItem('token');
    if (item) {
      try {
        const { value, expiry } = JSON.parse(item);
        if (Date.now() < expiry) {
          token = value;
        } else {
          sessionStorage.removeItem('token');
        }
      } catch {
        sessionStorage.removeItem('token');
      }
    }
    try {
      await fetch('/api/data/import/donors', {
        method: 'POST',
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
        body: formData
      });
      enqueueSnackbar('Donors imported!', { variant: 'success' });
    } catch (err) {
      setImportError('Failed to import donors');
      enqueueSnackbar('Failed to import donors', { variant: 'error' });
    } finally {
      setImportLoading(false);
      e.target.value = '';
    }
  };

  // Filter donors client-side
  const filteredDonors = donors.filter(donor => {
    const q = search.toLowerCase();
    return (
      donor.name?.toLowerCase().includes(q) ||
      donor.email?.toLowerCase().includes(q) ||
      donor.bloodGroup?.toLowerCase().includes(q)
    );
  });

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'name', headerName: 'Name', width: 150 },
    { field: 'email', headerName: 'Email', width: 180 },
    { field: 'phone', headerName: 'Phone', width: 130 },
    { field: 'bloodGroup', headerName: 'Blood Group', width: 120 },
    { field: 'address', headerName: 'Address', width: 180 },
    { field: 'donations', headerName: 'Donations', width: 110, type: 'number' },
    // { field: 'lastDonationDate', headerName: 'Last Donation', width: 160, valueGetter: (params) => params?.row?.lastDonationDate ? new Date(params.row.lastDonationDate).toLocaleDateString() : '' },
    {
      field: 'donationsThisYear',
      headerName: 'Donations (This Year)',
      width: 160,
      align: 'right',
      headerAlign: 'right',
      valueGetter: (params) => (params.row && typeof params.row.donationsThisYear === 'number') ? params.row.donationsThisYear : 0,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      renderCell: (params) => (
        <>
          <Button size="small" color="primary" onClick={() => handleEditOpen(params.row)}><Edit fontSize="small" /></Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row._id)} disabled={deleteLoading && deleteId === params.row._id}>
            <Delete fontSize="small" />
          </Button>
        </>
      )
    }
  ];

  return (
    <Box sx={{ height: 500, width: '100%', mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 2 }}>
        <TextField
          placeholder="Search donors..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          size="small"
          sx={{ width: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<DownloadIcon />} onClick={handleExport} disabled={donorsLoading}>
            Export CSV
          </Button>
          <input
            type="file"
            accept=".csv"
            style={{ display: 'none' }}
            ref={ref => (fileInputRef.current = ref)}
            onChange={handleImport}
          />
          <Button
            variant="outlined"
            startIcon={<UploadIcon />}
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={importLoading}
          >
            {importLoading ? 'Importing...' : 'Import CSV'}
          </Button>
          <Button variant="contained" color="primary" onClick={handleAddOpen}>Add Donor</Button>
        </Box>
      </Box>
      {importError && <Alert severity="error" sx={{ mb: 2 }}>{importError}</Alert>}
      {donorsLoading && <CircularProgress sx={{ mb: 2 }} />}
      {donorsError && <Alert severity="error" sx={{ mb: 2 }}>{donorsError}</Alert>}
      {deleteError && <Alert severity="error" sx={{ mb: 2 }}>{deleteError}</Alert>}
      <DataGrid
        rows={filteredDonors}
        columns={columns}
        getRowId={row => row._id}
        pageSize={7}
        rowsPerPageOptions={[7, 15, 30]}
        disableRowSelectionOnClick
      />
      {/* Add Donor Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose}>
        <DialogTitle>Add Donor</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <TextField label="Name" name="name" value={form.name} onChange={handleFormChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={form.email} onChange={handleFormChange} fullWidth margin="normal" required type="email" />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField label="Blood Group" name="bloodGroup" value={form.bloodGroup} onChange={handleFormChange} fullWidth margin="normal" required />
            <TextField label="Address" name="address" value={form.address} onChange={handleFormChange} fullWidth margin="normal" />
            <TextField label="Donations" name="donations" value={form.donations} onChange={handleFormChange} fullWidth margin="normal" type="number" />
            {addError && <Alert severity="error" sx={{ mt: 1 }}>{addError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleAddClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={addLoading}>{addLoading ? <CircularProgress size={20} /> : 'Add'}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Edit Donor Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose}>
        <DialogTitle>Edit Donor</DialogTitle>
        <form onSubmit={handleEditSubmit}>
          <DialogContent>
            <TextField label="Name" name="name" value={editForm.name || ''} onChange={handleEditFormChange} fullWidth margin="normal" required />
            <TextField label="Email" name="email" value={editForm.email || ''} onChange={handleEditFormChange} fullWidth margin="normal" required type="email" />
            <TextField label="Phone" name="phone" value={editForm.phone || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            <TextField label="Blood Group" name="bloodGroup" value={editForm.bloodGroup || ''} onChange={handleEditFormChange} fullWidth margin="normal" required />
            <TextField label="Address" name="address" value={editForm.address || ''} onChange={handleEditFormChange} fullWidth margin="normal" />
            <TextField label="Donations" name="donations" value={editForm.donations || 0} onChange={handleEditFormChange} fullWidth margin="normal" type="number" />
            {editError && <Alert severity="error" sx={{ mt: 1 }}>{editError}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleEditClose}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary" disabled={updateLoading}>{updateLoading ? <CircularProgress size={20} /> : 'Save'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

function RequestsTable({ onDonationFulfilled, refresh, setRefresh }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const [donors, setDonors] = useState([]);
  const [smartMatchingOpen, setSmartMatchingOpen] = useState(false);
  const [currentRequest, setCurrentRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
    fetchDonorsList();
  }, []);

  const fetchRequests = () => {
    setLoading(true);
    api.get('/requests')
      .then(res => setRequests(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load requests'))
      .finally(() => setLoading(false));
  };

  const fetchDonorsList = () => {
    api.get('/donors')
      .then(res => setDonors(res.data))
      .catch(() => setDonors([]));
  };

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    setActionError('');
    try {
      await api.put(`/requests/${id}`, { status });
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to update request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSmartMatching = (request) => {
    setCurrentRequest(request);
    setSmartMatchingOpen(true);
  };

  const handleSelectDonor = async (donor) => {
    if (!currentRequest) return;
    
    setActionLoading(true);
    setActionError('');
    try {
      await api.put(`/requests/${currentRequest._id}`, { 
        status: 'fulfilled', 
        fulfilledBy: donor._id 
      });
      setSmartMatchingOpen(false);
      setCurrentRequest(null);
      fetchRequests();
      if (onDonationFulfilled) onDonationFulfilled();
      setRefresh(r => r + 1); // trigger donor table refresh
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to fulfill request');
    } finally {
      setActionLoading(false);
    }
  };



  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;
    setActionLoading(true);
    setActionError('');
    try {
      await api.delete(`/requests/${id}`);
      fetchRequests();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete request');
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { field: '_id', headerName: 'ID', width: 220 },
    { field: 'requesterName', headerName: 'Name', width: 150 },
    { field: 'requesterEmail', headerName: 'Email', width: 180 },
    { field: 'bloodGroupNeeded', headerName: 'Blood Group', width: 120 },
    { 
      field: 'quantity', 
      headerName: 'Quantity', 
      width: 100, 
      type: 'number',
      align: 'center',
      headerAlign: 'center'
    },
    { field: 'status', headerName: 'Status', width: 120 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 300,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button 
            size="small" 
            color="primary" 
            onClick={() => handleSmartMatching(params.row)} 
            disabled={actionLoading || params.row.status === 'fulfilled'}
            startIcon={<AIIcon />}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            AI Match
          </Button>
          <Button 
            size="small" 
            color="warning" 
            onClick={() => handleStatusChange(params.row._id, 'cancelled')} 
            disabled={actionLoading || params.row.status === 'cancelled'}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Cancel
          </Button>
          <Button 
            size="small" 
            color="error" 
            onClick={() => handleDelete(params.row._id)} 
            disabled={actionLoading}
            sx={{ minWidth: 'auto', px: 1 }}
          >
            Delete
          </Button>
        </Box>
      )
    }
  ];

  return (
    <Box sx={{ height: 500, width: '100%', mt: 2 }}>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <DataGrid
        rows={requests}
        columns={columns}
        getRowId={row => row._id}
        pageSize={7}
        rowsPerPageOptions={[7, 15, 30]}
        disableRowSelectionOnClick
      />


      {/* AI Smart Matching Dialog */}
      <SmartMatching
        open={smartMatchingOpen}
        onClose={() => setSmartMatchingOpen(false)}
        request={currentRequest}
        donors={donors}
        onSelectDonor={handleSelectDonor}
      />
    </Box>
  );
}

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/profile')
      .then(res => setProfile(res.data))
      .catch(err => setError(err.response?.data?.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ mb: 2 }} />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  if (!profile) return null;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6">Profile</Typography>
      <Typography>Name: {profile.name}</Typography>
      <Typography>Email: {profile.email}</Typography>
      <Typography>Role: {profile.role}</Typography>
      <Typography>Verified: {profile.verified ? 'Yes' : 'No'}</Typography>
    </Paper>
  );
}

function UserAppointments() {
  const { data: appointments, loading, error } = useFetch(() => api.get('/appointments/my').then(res => res.data), []);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ date: '', reason: '' });
  const [rescheduleLoading, setRescheduleLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState('');
  const [success, setSuccess] = useState('');
  const [refresh, setRefresh] = useState(0);
  const enqueueSnackbar = useSnackbar();

  const handleOpen = (appt) => {
    setSelected(appt);
    setForm({ date: appt.date ? new Date(appt.date).toISOString().slice(0,16) : '', reason: appt.reason || '' });
    setOpen(true);
    setRescheduleError('');
    setSuccess('');
  };
  const handleClose = () => setOpen(false);
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };
  const handleReschedule = async e => {
    e.preventDefault();
    setRescheduleLoading(true);
    setRescheduleError('');
    setSuccess('');
    try {
      await rescheduleAppointment(selected._id, {
        date: new Date(form.date).toISOString(),
        reason: form.reason
      });
      setSuccess('Appointment rescheduled!');
      enqueueSnackbar('Appointment rescheduled!', { variant: 'success' });
      setOpen(false);
      setRefresh(r => r + 1);
    } catch (err) {
      setRescheduleError('Failed to reschedule');
      enqueueSnackbar('Failed to reschedule', { variant: 'error' });
    } finally {
      setRescheduleLoading(false);
    }
  };
  // re-fetch appointments after reschedule
  const { data: updatedAppointments } = useFetch(() => api.get('/appointments/my').then(res => res.data), [refresh]);
  const appts = updatedAppointments || appointments;

  if (loading) return <CircularProgress sx={{ mb: 2 }} />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error.message || error.toString()}</Alert>;
  if (!appts || !appts.length) return <Alert severity="info" sx={{ mb: 2 }}>No appointments found.</Alert>;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>My Appointments</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center"><b>Date</b></TableCell>
              <TableCell align="center"><b>Status</b></TableCell>
              <TableCell align="center"><b>Reason</b></TableCell>
              <TableCell align="center"><b>Actions</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appts.map(appt => (
              <TableRow key={appt._id}>
                <TableCell align="center">{appt.date ? new Date(appt.date).toLocaleString() : ''}</TableCell>
                <TableCell align="center">{appt.status}</TableCell>
                <TableCell align="center">{appt.reason || '-'}</TableCell>
                <TableCell align="center">
                  <Button size="small" variant="outlined" onClick={() => handleOpen(appt)} disabled={rescheduleLoading}>
                    Reschedule
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Reschedule Appointment</DialogTitle>
        <form onSubmit={handleReschedule}>
          <DialogContent>
            <TextField label="Date" name="date" type="datetime-local" value={form.date} onChange={handleChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
            <TextField label="Reason" name="reason" value={form.reason} onChange={handleChange} fullWidth margin="normal" />
            {rescheduleError && <Alert severity="error" sx={{ mt: 1 }}>{rescheduleError}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
          </DialogContent>
          <DialogActions>
            <Button type="submit" variant="contained" color="primary" disabled={rescheduleLoading}>{rescheduleLoading ? <CircularProgress size={20} /> : 'Reschedule'}</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Paper>
  );
}

function AppointmentForm({ onAppointmentCreated }) {
  const [form, setForm] = useState({ date: '', reason: '' });
  const [scheduleApi, { loading }] = useApi(scheduleAppointment);
  const enqueueSnackbar = useSnackbar();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [healthScreeningOpen, setHealthScreeningOpen] = useState(false);
  const { user } = useAuth();

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      // Ensure date is in ISO format
      const payload = {
        ...form,
        date: new Date(form.date).toISOString()
      };
      await scheduleApi(payload);
      setSuccess('Appointment scheduled!');
      enqueueSnackbar('Appointment scheduled!', { variant: 'success' });
      setForm({ date: '', reason: '' });
      if (onAppointmentCreated) onAppointmentCreated();
    } catch (err) {
      setError('Failed to schedule appointment');
      enqueueSnackbar('Failed to schedule appointment', { variant: 'error' });
    }
  };

  const handleHealthScreening = () => {
    setHealthScreeningOpen(true);
  };

  const handleScreeningComplete = (assessment) => {
    if (assessment.eligible) {
      enqueueSnackbar('Health screening passed! You can proceed with appointment.', { variant: 'success' });
    } else {
      enqueueSnackbar('Health screening shows some concerns. Please consult with medical staff.', { variant: 'warning' });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Schedule Appointment</Typography>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleHealthScreening}
          startIcon={<AIIcon />}
        >
          AI Health Screening
        </Button>
      </Box>
      <form onSubmit={handleSubmit}>
        <TextField label="Date" name="date" type="datetime-local" value={form.date} onChange={handleChange} fullWidth margin="normal" required InputLabelProps={{ shrink: true }} />
        <TextField label="Reason" name="reason" value={form.reason} onChange={handleChange} fullWidth margin="normal" />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Schedule'}
        </Button>
      </form>

      {/* AI Health Screening Bot */}
      <HealthScreeningBot
        open={healthScreeningOpen}
        onClose={() => setHealthScreeningOpen(false)}
        onComplete={handleScreeningComplete}
        donorData={user}
      />
    </Paper>
  );
}

function BloodRequestForm({ onRequestCreated, user }) {
  const [form, setForm] = useState({
    requesterName: user?.name || 'User',
    requesterEmail: user?.email || '',
    bloodGroupNeeded: '',
    quantity: 1
  });
  const [createRequestApi, { loading }] = useApi(createRequest);
  const enqueueSnackbar = useSnackbar();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await createRequestApi(form);
      setSuccess('Request submitted!');
      enqueueSnackbar('Request submitted!', { variant: 'success' });
      setForm({ ...form, bloodGroupNeeded: '', quantity: 1 });
      if (onRequestCreated) onRequestCreated();
    } catch (err) {
      setError('Failed to submit request');
      enqueueSnackbar('Failed to submit request', { variant: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Request Blood</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Name" name="requesterName" value={form.requesterName} onChange={handleChange} fullWidth margin="normal" required disabled />
        <TextField label="Email" name="requesterEmail" value={form.requesterEmail} onChange={handleChange} fullWidth margin="normal" required disabled />
        <TextField label="Blood Group Needed" name="bloodGroupNeeded" value={form.bloodGroupNeeded} onChange={handleChange} fullWidth margin="normal" required />
        <TextField label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} fullWidth margin="normal" required inputProps={{ min: 1 }} />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Submit Request'}
        </Button>
      </form>
    </Paper>
  );
}

function UserRequests({ user }) {
  const { data: requests, loading, error } = useFetch(() => api.get('/requests/my').then(res => res.data), []);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');
  const enqueueSnackbar = useSnackbar();
  const [refresh, setRefresh] = useState(0);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this request?')) return;
    setActionLoading(true);
    setActionError('');
    try {
      await api.put(`/requests/${id}`, { status: 'cancelled' });
      enqueueSnackbar('Request cancelled!', { variant: 'success' });
      setRefresh(r => r + 1);
    } catch (err) {
      setActionError('Failed to cancel request');
      enqueueSnackbar('Failed to cancel request', { variant: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <CircularProgress sx={{ mb: 2 }} />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error.message || error.toString()}</Alert>;
  if (!requests || !requests.length) return <Alert severity="info" sx={{ mb: 2 }}>No blood requests found.</Alert>;

  const userRequests = requests.filter(r => r.requesterEmail === user?.email);

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        My Blood Requests
      </Typography>
      {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Blood Group</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userRequests.map(req => (
              <TableRow key={req._id}>
                <TableCell>{req.requesterName || '-'}</TableCell>
                <TableCell>{req.bloodGroupNeeded}</TableCell>
                <TableCell>{req.quantity}</TableCell>
                <TableCell>{req.status}</TableCell>
                <TableCell>
                  {req.status !== 'cancelled' && (
                    <Button
                      size="small"
                      color="warning"
                      onClick={() => handleCancel(req._id)}
                      disabled={actionLoading}
                      sx={{ minWidth: 'auto', px: 1 }}
                    >
                      Cancel
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function FeedbackForm() {
  const [form, setForm] = useState({ message: '', rating: '' });
  const [submitFeedbackApi, { loading }] = useApi(submitFeedback);
  const enqueueSnackbar = useSnackbar();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sentiment, setSentiment] = useState(null);
  const [badWordError, setBadWordError] = useState('');

  // Simple bad words list (can be expanded)
  const badWords = [
    'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'damn', 'crap', 'dick', 'piss', 'cunt', 'fag', 'slut', 'whore', 'nigger', 'retard', 'idiot', 'moron', 'stupid', 'hate', 'kill', 'die', 'suck', 'screwed', 'bollocks', 'bugger', 'arse', 'twat', 'wanker', 'prick', 'cock', 'pussy', 'fucking', 'motherfucker', 'bullshit', 'douche', 'douchebag', 'jackass', 'jerk', 'loser', 'scum', 'trash', 'racist', 'sexist', 'terrorist', 'bomb', 'shoot', 'rape', 'molest', 'abuse', 'threat', 'suicide', 'murder', 'violence', 'kill yourself', 'go to hell', 'die in a fire', 'die', 'kys'
  ];

  // Check for bad words
  const containsBadWords = (text) => {
    if (!text) return false;
    const lower = text.toLowerCase();
    return badWords.some(word => lower.includes(word));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));

    // Analyze sentiment when message changes
    if (name === 'message') {
      if (containsBadWords(value)) {
        setBadWordError('Your feedback contains inappropriate language. Please remove bad words.');
      } else {
        setBadWordError('');
      }
      if (value) {
        const sentimentResult = analyzeFeedbackSentiment(value);
        setSentiment(sentimentResult);
      } else {
        setSentiment(null);
      }
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (containsBadWords(form.message)) {
      setBadWordError('Your feedback contains inappropriate language. Please remove bad words.');
      return;
    }
    try {
      await submitFeedbackApi(form);
      setSuccess('Feedback submitted!');
      enqueueSnackbar('Feedback submitted!', { variant: 'success' });
      setForm({ message: '', rating: '' });
      setSentiment(null);
    } catch (err) {
      setError('Failed to submit feedback');
      enqueueSnackbar('Failed to submit feedback', { variant: 'error' });
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Submit Feedback</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Message"
          name="message"
          value={form.message}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          multiline
          minRows={2}
          error={!!badWordError}
          helperText={badWordError}
        />
        {sentiment && !badWordError && (
          <Box sx={{ mt: 1, mb: 1 }}>
            <Chip
              label={`Sentiment: ${sentiment.sentiment} (Score: ${sentiment.score})`}
              color={sentiment.sentiment === 'POSITIVE' ? 'success' : sentiment.sentiment === 'NEGATIVE' ? 'error' : 'default'}
              size="small"
            />
          </Box>
        )}
        <TextField
          label="Rating (1-5)"
          name="rating"
          value={form.rating}
          onChange={handleChange}
          fullWidth
          margin="normal"
          required
          type="number"
          inputProps={{ min: 1, max: 5 }}
        />
        {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>{success}</Alert>}
        <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={loading || !!badWordError}>
          {loading ? <CircularProgress size={20} /> : 'Submit Feedback'}
        </Button>
      </form>
    </Paper>
  );
}

function Leaderboard() {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/donors')
      .then(res => setDonors(res.data.sort((a, b) => (b.donations || 0) - (a.donations || 0))))
      .catch(err => setError(err.response?.data?.message || 'Failed to load donors'))
      .finally(() => setLoading(false));
  }, []);

  // Assign badge based on rank
  const getBadge = (index) => {
    if (index === 0) return '🥇 Gold Donor';
    if (index === 1) return '🥈 Silver Donor';
    if (index === 2) return '🥉 Bronze Donor';
    return '';
  };

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Box display="flex" alignItems="center" mb={2}>
        <EmojiEventsIcon color="warning" sx={{ mr: 1 }} />
        <Typography variant="h6">Leaderboard</Typography>
      </Box>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="right">Rank</TableCell>
              <TableCell>Name</TableCell>
              <TableCell align="right">Donations</TableCell>
              <TableCell align="center">Badge</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {donors.slice(0, 10).map((donor, i) => (
              <TableRow
                key={donor._id}
                sx={
                  i === 0
                    ? {
                        fontWeight: 'bold',
                        backgroundColor: isDark ? '#333' : '#fffde7',
                        color: isDark ? '#ffe082' : 'inherit',
                      }
                    : {}
                }
              >
                <TableCell align="right" sx={i === 0 ? { fontWeight: 'bold' } : {}}>{i + 1}</TableCell>
                <TableCell sx={i === 0 ? { fontWeight: 'bold' } : {}}>{donor.name}</TableCell>
                <TableCell align="right" sx={i === 0 ? { fontWeight: 'bold' } : {}}>{donor.donations || 0}</TableCell>
                <TableCell align="center" sx={i === 0 ? { fontWeight: 'bold' } : {}}>{getBadge(i)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function PaymentSection({ user }) {
  const enqueueSnackbar = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    try {
      const res = await api.post('/payment/create-session', { amount: Number(amount), email: user.email });
      window.location.href = res.data.url;
    } catch (err) {
      enqueueSnackbar('Payment failed', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Donate</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <TextField
          label="Amount (USD)"
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          size="small"
          sx={{ width: 150 }}
        />
        <Button variant="contained" color="primary" onClick={handlePayment} disabled={loading || !amount}>
          {loading ? <CircularProgress size={20} /> : 'Donate'}
        </Button>
      </Box>
    </Paper>
  );
}

function VerifyUserSection() {
  const enqueueSnackbar = useSnackbar();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const sendCode = async () => {
    setLoading(true);
    try {
      await api.post('/verify/send');
      setSent(true);
      enqueueSnackbar('Verification code sent!', { variant: 'success' });
    } catch {
      enqueueSnackbar('Failed to send code', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const confirmCode = async () => {
    setVerifying(true);
    try {
      await api.post('/verify/confirm', { token: code });
      enqueueSnackbar('Account verified!', { variant: 'success' });
    } catch {
      enqueueSnackbar('Verification failed', { variant: 'error' });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Verify Your Account</Typography>
      <Button variant="outlined" onClick={sendCode} disabled={loading} sx={{ mb: 2 }}>
        {loading ? <CircularProgress size={20} /> : 'Send Verification Code'}
      </Button>
      {sent && (
        <Box display="flex" alignItems="center" gap={2}>
          <TextField
            label="Enter Code"
            value={code}
            onChange={e => setCode(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={confirmCode} disabled={verifying || !code}>
            {verifying ? <CircularProgress size={20} /> : 'Verify'}
          </Button>
        </Box>
      )}
    </Paper>
  );
}

function RemindersSection({ isAdmin }) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [error, setError] = useState('');

  const handleSendReminders = async () => {
    setLoading(true);
    setError('');
    setResult('');
    try {
      const res = await fetchReminders();
      setResult(res.message || 'Reminders sent!');
    } catch (err) {
      setError('Failed to send reminders');
    } finally {
      setLoading(false);
    }
  };

  if (isAdmin) {
    return (
      <Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', mt: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Reminders</Typography>
        <Button variant="contained" color="primary" onClick={handleSendReminders} disabled={loading}>
          {loading ? 'Sending...' : 'Send Appointment Reminders'}
        </Button>
        {result && <Alert severity="success" sx={{ mt: 2 }}>{result}</Alert>}
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </Paper>
    );
  }
  // User view
  return (
    <Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', mt: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Reminders</Typography>
      <Typography variant="body1">You will receive an email reminder automatically before your scheduled appointment.</Typography>
    </Paper>
  );
}

function AuditLogsSection() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showScrollIcon, setShowScrollIcon] = useState(false);
  const scrollRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setLoading(true);
    fetchAuditLogs()
      .then(setLogs)
      .catch(() => setError('Failed to load audit logs'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      const { scrollHeight, clientHeight } = scrollRef.current;
      setShowScrollIcon(scrollHeight > clientHeight);
    };
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [logs]);

  // Helper to get action icon
  const getActionIcon = (action) => {
    if (!action) return null;
    if (action.toLowerCase() === 'update') return <EditIcon fontSize="small" color="info" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
    if (action.toLowerCase() === 'create') return <AddCircleOutlineIcon fontSize="small" color="success" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
    if (action.toLowerCase() === 'delete') return <DeleteOutlineIcon fontSize="small" color="error" sx={{ verticalAlign: 'middle', mr: 0.5 }} />;
    return null;
  };

  return (
    <Paper elevation={8} sx={{
      p: 0,
      width: '100%',
      borderRadius: 5,
      boxShadow: '0 6px 32px 0 rgba(0,0,0,0.13)',
      mt: 4,
      position: 'relative',
      bgcolor: isDark ? '#232323' : '#f7f7fa',
      overflow: 'hidden',
    }}>
      <Box sx={{ px: 4, py: 3, borderBottom: isDark ? '1px solid #333' : '1px solid #e0e0e0', bgcolor: isDark ? '#232323' : '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.5, color: isDark ? '#fff' : 'text.primary' }}>Audit Logs</Typography>
      </Box>
      {loading && <CircularProgress sx={{ m: 3 }} />}
      {error && <Alert severity="error" sx={{ m: 3 }}>{error}</Alert>}
      <Box
        ref={scrollRef}
        sx={{
          maxHeight: 340,
          overflowY: 'auto',
          borderRadius: 0,
          position: 'relative',
          bgcolor: isDark ? '#232323' : '#f7f7fa',
          px: 0,
        }}
      >
        <TableContainer sx={{ minWidth: 700, bgcolor: 'transparent' }}>
          <Table size="small" sx={{ bgcolor: 'transparent' }}>
            <TableHead>
              <TableRow sx={{ bgcolor: isDark ? '#232323' : '#f3f3f7' }}>
                <TableCell sx={{ fontWeight: 700, color: isDark ? '#fff' : '#222', border: 'none', py: 1.5, fontSize: 15 }}>Time</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? '#fff' : '#222', border: 'none', py: 1.5, fontSize: 15 }}>Admin Email</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? '#fff' : '#222', border: 'none', py: 1.5, fontSize: 15 }}>Action</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? '#fff' : '#222', border: 'none', py: 1.5, fontSize: 15 }}>Target Model</TableCell>
                <TableCell sx={{ fontWeight: 700, color: isDark ? '#fff' : '#222', border: 'none', py: 1.5, fontSize: 15 }}>Target ID</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, idx) => (
                <TableRow
                  key={log._id}
                  sx={{
                    bgcolor: idx % 2 === 0 ? (isDark ? '#232323' : '#fff') : (isDark ? '#26282b' : '#f7f7fa'),
                    borderBottom: isDark ? '1px solid #292929' : '1px solid #ececec',
                    transition: 'background 0.2s',
                  }}
                >
                  <TableCell sx={{ border: 'none', py: 1.2, color: isDark ? '#e0e0e0' : '#333', fontSize: 14 }}>
                    {log.timestamp ? new Date(log.timestamp).toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }) : ''}
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1.2, color: isDark ? '#bdbdbd' : '#444', fontSize: 14 }}>{log.adminEmail}</TableCell>
                  <TableCell sx={{ border: 'none', py: 1.2, color: isDark ? '#90caf9' : '#1976d2', fontWeight: 600, fontSize: 14 }}>
                    {getActionIcon(log.action)}{log.action}
                  </TableCell>
                  <TableCell sx={{ border: 'none', py: 1.2, color: isDark ? '#fffde7' : '#d32f2f', fontWeight: 600, fontSize: 14 }}>{log.targetModel}</TableCell>
                  <TableCell sx={{ border: 'none', py: 1.2, color: isDark ? '#bdbdbd' : '#888', fontSize: 13, fontFamily: 'monospace' }}>{log.targetId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {/* Scroll Down Icon */}
        <Fade in={showScrollIcon} timeout={500}>
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 8,
              display: 'flex',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 36, color: isDark ? '#888' : '#bbb', opacity: 0.7, background: isDark ? '#232323cc' : '#fff8', borderRadius: '50%' }} />
          </Box>
        </Fade>
      </Box>
    </Paper>
  );
}

function TodaysFulfilledDonors() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setLoading(true);
    let token;
    const item = sessionStorage.getItem('token');
    if (item) {
      try {
        const { value, expiry } = JSON.parse(item);
        if (Date.now() < expiry) {
          token = value;
        }
      } catch {}
    }
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    fetch(`${baseUrl}/requests/fulfilled/today`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => setRequests(data))
      .catch(() => setError('Failed to load fulfilled requests'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ mb: 2 }} />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  if (!requests.length) return <Alert severity="info" sx={{ mb: 2 }}>No requests fulfilled today yet.</Alert>;

  return (
    <Paper sx={{ p: 3, mb: 3, borderRadius: 3, boxShadow: 2, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit', mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
        Donors Who Fulfilled Requests Today
      </Typography>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Donor ID</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Address</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Blood Group</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Quantity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map(req => (
              <TableRow key={req._id}>
                <TableCell>{req.fulfilledBy?._id || '-'}</TableCell>
                <TableCell>{req.fulfilledBy?.name || '-'}</TableCell>
                <TableCell>{req.fulfilledBy?.address || '-'}</TableCell>
                <TableCell>{req.fulfilledBy?.bloodGroup || '-'}</TableCell>
                <TableCell>{req.quantity}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function AppointmentsTable() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    fetchAllAppointments()
      .then(setAppointments)
      .catch(() => setError('Failed to load appointments'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>All Appointments</Typography>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Donor</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Reason</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {appointments.map(appt => (
              <TableRow key={appt._id}>
                <TableCell>{appt._id}</TableCell>
                <TableCell>{appt.donorId?.name || '-'}</TableCell>
                <TableCell>{appt.userId?.name || appt.userId?.email || '-'}</TableCell>
                <TableCell>{appt.date ? new Date(appt.date).toLocaleString() : '-'}</TableCell>
                <TableCell>{appt.status}</TableCell>
                <TableCell>{appt.reason || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function PaymentsTable() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setLoading(true);
    fetchAllPayments()
      .then(setPayments)
      .catch(() => setError('Failed to load payments'))
      .finally(() => setLoading(false));
  }, []);
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>All Payments</Typography>
      {loading && <CircularProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {payments.map(pay => (
              <TableRow key={pay._id}>
                <TableCell>{pay.paymentId}</TableCell>
                <TableCell>{pay.userId?.name || pay.userId?.email || '-'}</TableCell>
                <TableCell>{pay.amount}</TableCell>
                <TableCell>{pay.createdAt ? new Date(pay.createdAt).toLocaleString() : '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}

function FeedbackTable() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    setLoading(true);
    fetchFeedback()
      .then(setFeedbacks)
      .catch(() => setError('Failed to load feedback'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress sx={{ mb: 2 }} />;
  if (error) return <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>;
  if (!feedbacks || !feedbacks.length) return <Alert severity="info" sx={{ mb: 2 }}>No feedback found.</Alert>;

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>All Feedback</Typography>
      <Box sx={{ overflowX: 'auto' }}>
        <Table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <TableHead>
            <TableRow>
              <TableCell align="center"><b>Date</b></TableCell>
              <TableCell align="center"><b>User Name</b></TableCell>
              <TableCell align="center"><b>User ID</b></TableCell>
              <TableCell align="center"><b>Rating</b></TableCell>
              <TableCell align="center"><b>Message</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {feedbacks.map(fb => (
              <TableRow key={fb._id}>
                <TableCell align="center">{fb.createdAt ? new Date(fb.createdAt).toLocaleString() : '-'}</TableCell>
                <TableCell align="center">{fb.userId?.name || '-'}</TableCell>
                <TableCell align="center">{fb.userId?._id || '-'}</TableCell>
                <TableCell align="center">{fb.rating}</TableCell>
                <TableCell align="center">{fb.message}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [statsError, setStatsError] = useState('');
  const [tab, setTab] = useState(0);
  const isAdmin = user?.role === 'admin';
  const [refresh, setRefresh] = useState(0);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Only fetch analytics for admin
  useEffect(() => {
    if (isAdmin) {
      setStatsLoading(true);
      api.get('/analytics/stats')
        .then(res => {
          setStats(res.data);
        })
        .catch(err => setStatsError(err.response?.data?.message || 'Failed to load stats'))
        .finally(() => setStatsLoading(false));
    }
  }, [isAdmin, refresh]);

  const tabLabels = isAdmin
    ? ['Analytics', 'Donors', 'Requests', 'Appointments', 'Payments', 'Feedback']
    : ['Dashboard'];

  function handleDonationFulfilled() {
    setStats(prev => prev ? { ...prev, donationsToday: (prev.donationsToday || 0) + 1 } : prev);
    setRefresh(r => r + 1); // Also refresh fulfilled donors list
  }

  if (isAdmin) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ color: isDark ? '#fff' : 'text.primary' }}>Admin Dashboard</Typography>
        <Typography variant="h6" gutterBottom sx={{ color: isDark ? '#e0e0e0' : 'text.secondary' }}>Welcome, {user?.name || user?.email || 'Admin'}!</Typography>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mt: 2, mb: 2 }}>
          {tabLabels.map(label => <Tab key={label} label={label} />)}
        </Tabs>
        <Fade in={true} key={tab} timeout={600}>
          <div>
            {tab === 0 && <>
              <AdminAnalytics stats={stats} loading={statsLoading} error={statsError} />
              <AuditLogsSection sx={{ mt: 6 }} />
            </>}
            {tab === 1 && <DonorTable refresh={refresh} />}
            {tab === 2 && <RequestsTable onDonationFulfilled={handleDonationFulfilled} refresh={refresh} setRefresh={setRefresh} />}
            {tab === 3 && <AppointmentsTable />}
            {tab === 4 && <PaymentsTable />}
            {tab === 5 && <FeedbackTable />}
          </div>
        </Fade>
        <Divider sx={{ mt: 6, mb: 2, bgcolor: isDark ? '#333' : undefined }} />
        <Fade in={true} timeout={1200}><div><RemindersSection isAdmin sx={{ mt: 4 }} /></div></Fade>
        <Fade in={true} timeout={1800}><div><TodaysFulfilledDonors key={refresh} /></div></Fade>
      </Box>
    );
  }

  // For user dashboard, animate refreshes (appointments, requests, etc.)
  return (
    <Box sx={{
      mt: 4,
      mb: 4,
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      bgcolor: isDark ? 'background.default' : '#f8fafc',
    }}>
      <Box sx={{
        width: '100%',
        maxWidth: 1200,
        px: { xs: 1, sm: 3 },
        py: { xs: 2, sm: 4 },
        borderRadius: 4,
        boxShadow: 0,
        bgcolor: 'transparent',
      }}>
        <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: 700, letterSpacing: 1, color: isDark ? '#fff' : 'text.primary' }}>
          User Dashboard
        </Typography>
        <Typography variant="h6" align="center" sx={{ mb: 4, color: isDark ? '#e0e0e0' : 'text.secondary' }}>
          Welcome, {user?.name || user?.email || 'User'}!
        </Typography>
        <Grid container spacing={4} sx={{ width: '100%', m: 0, justifyContent: 'center' }}>
          <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Fade in={true} key={refresh + '-profile'} timeout={600}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <UserProfile />
            </Paper></div></Fade>
            <Fade in={true} key={refresh + '-feedback'} timeout={900}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <FeedbackForm />
            </Paper></div></Fade>
          </Grid>
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <Fade in={true} key={refresh + '-appointments'} timeout={1200}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', mb: 2, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <EventIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#fff' : 'text.primary' }}>My Appointments</Typography>
              </Box>
              <AppointmentForm onAppointmentCreated={() => setRefresh(r => r + 1)} />
              <UserAppointments />
            </Paper></div></Fade>
            <Fade in={true} key={refresh + '-requests'} timeout={1500}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', mb: 2, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <BloodtypeIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#fff' : 'text.primary' }}>Blood Requests</Typography>
              </Box>
              <BloodRequestForm user={user} onRequestCreated={() => setRefresh(r => r + 1)} />
              <UserRequests user={user} key={refresh} />
            </Paper></div></Fade>
            <Fade in={true} key={refresh + '-leaderboard'} timeout={1800}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', mb: 2, bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <Box display="flex" alignItems="center" mb={2}>
                <EmojiEventsIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: isDark ? '#fff' : 'text.primary' }}>Leaderboard</Typography>
              </Box>
              <Leaderboard />
            </Paper></div></Fade>
            <Fade in={true} key={refresh + '-payment'} timeout={2100}><div><Paper elevation={6} sx={{ p: 3, width: '100%', borderRadius: 4, boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)', bgcolor: isDark ? '#232323' : '#fff', color: isDark ? '#fff' : 'inherit' }}>
              <PaymentSection user={user} />
            </Paper></div></Fade>
            <Fade in={true} key={refresh + '-reminders'} timeout={2400}><div><RemindersSection isAdmin={false} /></div></Fade>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}