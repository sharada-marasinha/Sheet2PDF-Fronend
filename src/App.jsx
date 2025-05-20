import React, { useState } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  CircularProgress,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Snackbar,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Description, Preview, CloudDownload, Error, Info } from '@mui/icons-material';

function App() {
  const [sheetUrl, setSheetUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handlePreview = async () => {
    if (!sheetUrl) {
      setError('Please enter a Google Sheet URL');
      return;
    }

    setPreviewLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/preview-sheet', { sheetUrl });
      setPreviewData(res.data);
      setSuccess(`Successfully loaded ${res.data.count} students`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch sheet data');
      setPreviewData(null);
    }
    setPreviewLoading(false);
  };

  const handleGenerate = async () => {
    if (!previewData) {
      setError('Please preview the sheet first');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post('http://localhost:5000/generate-pdfs', { sheetUrl }, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `student_forms_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      setSuccess(`Successfully generated ${previewData.count} PDFs`);
    } catch (err) {
      setError('Failed to generate PDFs');
    }
    setLoading(false);
  };

  const handleCloseError = () => setError(null);
  const handleCloseSuccess = () => setSuccess(null);
  const handleCloseDialog = () => setDialogOpen(false);

  const openStudentDialog = (student) => {
    setSelectedStudent(student);
    setDialogOpen(true);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Student Form Generator
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Google Sheet URL"
              variant="outlined"
              value={sheetUrl}
              onChange={(e) => setSheetUrl(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/..."
            />
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handlePreview}
              disabled={previewLoading || !sheetUrl}
              startIcon={previewLoading ? <CircularProgress size={20} /> : <Preview />}
            >
              Preview
            </Button>
          </Grid>
          
          <Grid item xs={6} md={2}>
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={handleGenerate}
              disabled={loading || !previewData}
              startIcon={loading ? <CircularProgress size={20} /> : <CloudDownload />}
            >
              Generate
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {previewData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" component="h2" gutterBottom>
              Sheet Preview
            </Typography>
            <Typography color="textSecondary" gutterBottom>
              Found {previewData.count} students
            </Typography>
            
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table size="small" aria-label="student preview table">
                <TableHead>
                  <TableRow>
                    {previewData.headers.map((header, index) => (
                      <TableCell key={index}>{header}</TableCell>
                    ))}
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {previewData.students.map((student, rowIndex) => (
                    <TableRow key={rowIndex}>
                      <TableCell>{rowIndex+1}</TableCell>
                      {student.map((value, colIndex) => (
                        <TableCell key={colIndex}>{value || '-'}</TableCell>
                      ))}
                      <TableCell align="right">
                        <Tooltip title="View details">
                          <IconButton onClick={() => openStudentDialog(student)}>
                            <Info color="primary" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                  {previewData.students.length > 5 && (
                    <TableRow>
                      <TableCell colSpan={previewData.headers.length + 1} align="center">
                        ... and {previewData.students.length - 5} more students
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button 
              size="small" 
              startIcon={<Description />}
              onClick={handleGenerate}
              disabled={loading}
            >
              Generate All PDFs
            </Button>
          </CardActions>
        </Card>
      )}

      {/* Student Details Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Student Details</DialogTitle>
        <DialogContent>
          {selectedStudent && previewData && (
            <TableContainer>
              <Table>
                <TableBody>
                  {previewData.headers.map((header, index) => (
                    <TableRow key={index}>
                      <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                        {header}
                      </TableCell>
                      <TableCell>{selectedStudent[index] || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Notifications */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default App;