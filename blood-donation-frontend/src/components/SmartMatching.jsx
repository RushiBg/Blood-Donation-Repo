import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Divider,
  useTheme,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Psychology as AIIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Favorite as HeartIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  AutoAwesome as SmartIcon
} from '@mui/icons-material';
import { findBestDonorMatch } from '../features/ai';

const SmartMatching = ({ request, donors, onSelectDonor, open, onClose }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  useEffect(() => {
    if (open && request && donors) {
      findMatches();
    }
  }, [open, request, donors]);

  const findMatches = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Use AI matching algorithm
      const aiMatches = findBestDonorMatch(request, donors);
      
      if (!aiMatches || aiMatches.length === 0) {
        setError('No compatible donors found for this blood type.');
        setMatches([]);
        return;
      }

      // Enhance matches with additional data
      const enhancedMatches = aiMatches.map((match, index) => ({
        ...match,
        rank: index + 1,
        compatibility: calculateCompatibility(match, request),
        lastActive: getLastActiveStatus(match),
        reliability: calculateReliability(match)
      }));

      setMatches(enhancedMatches);
    } catch (err) {
      setError('Failed to find matches. Please try again.');
      console.error('Matching error:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompatibility = (donor, request) => {
    let score = 0;
    
    // Blood group compatibility (perfect match)
    if (donor.bloodGroup === request.bloodGroupNeeded) {
      score += 100;
    }
    
    // Donation experience
    score += (donor.donations || 0) * 5;
    
    // Recent activity
    if (donor.lastDonationDate) {
      const daysSinceLastDonation = (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastDonation >= 56) {
        score += 20; // Eligible to donate
      }
    }
    
    // Donations this year
    score += (donor.donationsThisYear || 0) * 3;
    
    return Math.min(score, 100);
  };

  const getLastActiveStatus = (donor) => {
    if (!donor.lastDonationDate) return 'Never donated';
    
    const daysSinceLastDonation = (Date.now() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastDonation < 56) {
      return `Donated ${Math.ceil(daysSinceLastDonation)} days ago (not eligible yet)`;
    } else if (daysSinceLastDonation < 365) {
      return `Donated ${Math.ceil(daysSinceLastDonation)} days ago`;
    } else {
      return `Donated ${Math.ceil(daysSinceLastDonation / 365)} years ago`;
    }
  };

  const calculateReliability = (donor) => {
    let reliability = 'MEDIUM';
    
    if (donor.donations >= 10) reliability = 'HIGH';
    if (donor.donations >= 5) reliability = 'MEDIUM';
    if (donor.donations < 5) reliability = 'LOW';
    
    return reliability;
  };

  const getReliabilityColor = (reliability) => {
    switch (reliability) {
      case 'HIGH': return 'success';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'error';
      default: return 'default';
    }
  };

  const getReliabilityIcon = (reliability) => {
    switch (reliability) {
      case 'HIGH': return <CheckIcon />;
      case 'MEDIUM': return <WarningIcon />;
      case 'LOW': return <InfoIcon />;
      default: return <InfoIcon />;
    }
  };

  const handleSelectDonor = (match) => {
    setSelectedMatch(match);
  };

  const handleConfirmSelection = () => {
    if (selectedMatch && onSelectDonor) {
      onSelectDonor(selectedMatch);
      onClose();
    }
  };

  const getMatchBadge = (rank) => {
    switch (rank) {
      case 1: return { label: '🥇 Best Match', color: 'success' };
      case 2: return { label: '🥈 Good Match', color: 'warning' };
      case 3: return { label: '🥉 Available', color: 'info' };
      default: return { label: `Match #${rank}`, color: 'default' };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: isDark ? '#232323' : '#fff',
          color: isDark ? '#fff' : 'inherit'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        borderBottom: isDark ? '1px solid #333' : '1px solid #e0e0e0'
      }}>
        <Avatar sx={{ bgcolor: 'primary.main' }}>
          <AIIcon />
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6">AI-Powered Donor Matching</Typography>
          <Typography variant="body2" color="text.secondary">
            Finding the best donors for {request?.bloodGroupNeeded} blood request
          </Typography>
        </Box>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && matches.length > 0 && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SmartIcon color="primary" />
              <Typography variant="subtitle1" fontWeight="bold">
                AI Found {matches.length} Compatible Donors
              </Typography>
            </Box>

            <List sx={{ width: '100%' }}>
              {matches.map((match, index) => {
                const badge = getMatchBadge(match.rank);
                return (
                  <React.Fragment key={match._id}>
                    <ListItem
                      sx={{
                        border: selectedMatch?._id === match._id ? '2px solid' : '1px solid',
                        borderColor: selectedMatch?._id === match._id ? 'primary.main' : isDark ? '#333' : '#e0e0e0',
                        borderRadius: 2,
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: isDark ? '#333' : '#f5f5f5'
                        }
                      }}
                      onClick={() => handleSelectDonor(match)}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <PersonIcon />
                        </Avatar>
                      </ListItemAvatar>
                      
                      <ListItemText
                        primary={
                          <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography component="span" variant="subtitle1" fontWeight="bold">
                              {match.name}
                            </Typography>
                            <Chip
                              label={badge.label}
                              color={badge.color}
                              size="small"
                              icon={<AIIcon />}
                            />
                          </Box>
                        }
                        secondary={
                          <Box component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Chip
                                label={`${match.bloodGroup}`}
                                color="primary"
                                size="small"
                              />
                              <Chip
                                label={`${match.donations || 0} donations`}
                                variant="outlined"
                                size="small"
                              />
                              <Chip
                                icon={getReliabilityIcon(match.reliability)}
                                label={`Reliability: ${match.reliability}`}
                                color={getReliabilityColor(match.reliability)}
                                size="small"
                              />
                            </Box>
                            
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Typography component="span" variant="body2" color="text.secondary">
                                <LocationIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {match.address || 'Address not provided'}
                              </Typography>
                            </Box>
                            
                            <Typography component="span" variant="body2" color="text.secondary">
                              {match.lastActive}
                            </Typography>
                            
                            <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <HeartIcon fontSize="small" color="primary" />
                              <Typography component="span" variant="body2" color="primary">
                                Compatibility Score: {match.compatibility}%
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </ListItem>
                    
                    {index < matches.length - 1 && (
                      <Divider sx={{ my: 1 }} />
                    )}
                  </React.Fragment>
                );
              })}
            </List>
          </Box>
        )}
      </DialogContent>

      {selectedMatch && (
        <DialogActions sx={{ p: 2, borderTop: isDark ? '1px solid #333' : '1px solid #e0e0e0' }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleConfirmSelection}
            startIcon={<CheckIcon />}
          >
            Select {selectedMatch.name}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default SmartMatching; 