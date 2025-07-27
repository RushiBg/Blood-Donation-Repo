import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Chip,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  useTheme
} from '@mui/material';
import {
  SmartToy as BotIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { assessDonorHealth } from '../features/ai';

const HealthScreeningBot = ({ open, onClose, onComplete, donorData }) => {
  const [messages, setMessages] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [assessment, setAssessment] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Base questions for all genders
  const baseQuestions = [
    {
      id: 'gender',
      question: "What is your gender? (Male/Female/Other)",
      type: 'text',
      validation: (value) => ['male', 'female', 'other'].includes(value.toLowerCase()),
      errorMessage: "Please specify your gender (Male/Female/Other)."
    },
    {
      id: 'age',
      question: "What is your age?",
      type: 'number',
      validation: (value) => value >= 18 && value <= 65,
      errorMessage: "You must be between 18-65 years old to donate blood."
    },
    {
      id: 'weight',
      question: "What is your weight in kg?",
      type: 'number',
      validation: (value) => value >= 50,
      errorMessage: "You must weigh at least 50kg to donate blood."
    },
    {
      id: 'health_conditions',
      question: "Do you have any of these conditions? (HIV, Hepatitis, Cancer, Heart disease, Diabetes requiring insulin)",
      type: 'boolean',
      validation: (value) => value === false,
      errorMessage: "You may not be eligible to donate if you have these conditions."
    },
    {
      id: 'medications',
      question: "Are you currently taking any medications?",
      type: 'text',
      validation: (value) => !value.toLowerCase().includes('blood thinner'),
      errorMessage: "Blood thinners may affect your eligibility."
    },
    {
      id: 'recent_surgery',
      question: "Have you had surgery in the last 6 months?",
      type: 'boolean',
      validation: (value) => value === false,
      errorMessage: "You may need to wait 6 months after surgery."
    }
  ];

  // Female-specific questions
  const femaleQuestions = [
    {
      id: 'pregnancy',
      question: "Are you pregnant or have you given birth in the last 6 weeks?",
      type: 'boolean',
      validation: (value) => value === false,
      errorMessage: "Pregnant women and recent mothers may not be eligible."
    },
    {
      id: 'menstrual',
      question: "Are you currently on your menstrual cycle?",
      type: 'boolean',
      validation: (value) => true, // This is informational, not a disqualifier
      errorMessage: "This is for informational purposes only."
    },
    {
      id: 'iron_levels',
      question: "Do you have a history of low iron levels or anemia?",
      type: 'boolean',
      validation: (value) => true, // Informational
      errorMessage: "This helps us provide better recommendations."
    },
    {
      id: 'birth_control',
      question: "Are you currently taking birth control pills?",
      type: 'boolean',
      validation: (value) => true, // Informational
      errorMessage: "This helps us assess your eligibility."
    }
  ];

  // Male-specific questions
  const maleQuestions = [
    {
      id: 'prostate_health',
      question: "Do you have any prostate-related health issues?",
      type: 'boolean',
      validation: (value) => true, // Informational
      errorMessage: "This helps us provide better recommendations."
    },
    {
      id: 'testosterone',
      question: "Are you currently taking testosterone supplements?",
      type: 'boolean',
      validation: (value) => true, // Informational
      errorMessage: "This helps us assess your eligibility."
    }
  ];

  // Other gender questions (more general)
  const otherQuestions = [
    {
      id: 'general_health',
      question: "Do you have any specific health concerns we should know about?",
      type: 'text',
      validation: (value) => true, // Informational
      errorMessage: "This helps us provide better recommendations."
    }
  ];

  // Function to get questions based on gender
  const getQuestionsByGender = (gender) => {
    let questions = [...baseQuestions];
    
    if (gender === 'female') {
      questions = questions.concat(femaleQuestions);
    } else if (gender === 'male') {
      questions = questions.concat(maleQuestions);
    } else {
      questions = questions.concat(otherQuestions);
    }
    
    return questions;
  };

  const [screeningQuestions, setScreeningQuestions] = useState(baseQuestions);

  useEffect(() => {
    if (open) {
      initializeChat();
    }
  }, [open]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const initializeChat = () => {
    const welcomeMessage = {
      id: 'welcome',
      type: 'bot',
      content: `Hello! I'm your AI health screening assistant. I'll help determine if you're eligible to donate blood. Let's start with a few questions.`,
      timestamp: new Date()
    };
    
    setMessages([welcomeMessage]);
    setCurrentQuestion(0);
    setAssessment(null);
    setChatHistory([]);
    
    // Auto-ask first question
    setTimeout(() => {
      askQuestion(0);
    }, 1000);
  };

  const askQuestion = (questionIndex) => {
    if (questionIndex >= screeningQuestions.length) {
      completeAssessment();
      return;
    }

    const question = screeningQuestions[questionIndex];
    const questionMessage = {
      id: `question_${questionIndex}`,
      type: 'bot',
      content: question.question,
      questionData: question,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, questionMessage]);
  };

  const handleUserInput = async () => {
    if (!userInput.trim()) return;

    const currentQ = screeningQuestions[currentQuestion];
    const userMessage = {
      id: `answer_${currentQuestion}`,
      type: 'user',
      content: userInput,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setChatHistory(prev => [...prev, { question: currentQ.id, answer: userInput }]);

    // Validate answer
    const isValid = validateAnswer(currentQ, userInput);
    
    if (!isValid) {
      const errorMessage = {
        id: `error_${currentQuestion}`,
        type: 'bot',
        content: currentQ.errorMessage,
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setUserInput('');
      return;
    }

    // Special handling for gender question
    if (currentQ.id === 'gender') {
      const gender = userInput.toLowerCase().trim();
      handleGenderAnswer(gender);
      
      // Reset to ask the first question of the new gender-specific set
      setCurrentQuestion(1); // Skip gender question (index 0) in the new set
      setUserInput('');
      
      setTimeout(() => {
        askQuestion(1); // Start with age question
      }, 1000);
      return;
    }

    setUserInput('');
    setCurrentQuestion(prev => prev + 1);
    
    // Ask next question
    setTimeout(() => {
      askQuestion(currentQuestion + 1);
    }, 500);
  };

  const validateAnswer = (question, answer) => {
    switch (question.type) {
      case 'number':
        const numValue = parseFloat(answer);
        return !isNaN(numValue) && question.validation(numValue);
      case 'boolean':
        const boolValue = answer.toLowerCase().includes('yes') || answer.toLowerCase().includes('true');
        return question.validation(boolValue);
      case 'text':
        if (question.id === 'gender') {
          // Normalize gender input
          const normalizedAnswer = answer.toLowerCase().trim();
          return ['male', 'female', 'other'].includes(normalizedAnswer);
        }
        return question.validation(answer);
      default:
        return true;
    }
  };

  const handleGenderAnswer = (gender) => {
    // Update questions based on gender
    const genderSpecificQuestions = getQuestionsByGender(gender);
    setScreeningQuestions(genderSpecificQuestions);
    
    // Add a personalized message based on gender
    const genderMessage = {
      id: 'gender_confirmation',
      type: 'bot',
      content: getGenderSpecificMessage(gender),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, genderMessage]);
  };

  const getGenderSpecificMessage = (gender) => {
    switch (gender) {
      case 'female':
        return "Thank you! I'll now ask you some female-specific health questions to ensure your safety and eligibility for blood donation.";
      case 'male':
        return "Thank you! I'll now ask you some male-specific health questions to ensure your safety and eligibility for blood donation.";
      case 'other':
        return "Thank you! I'll now ask you some general health questions to ensure your safety and eligibility for blood donation.";
      default:
        return "Thank you! Let's continue with the health screening.";
    }
  };

  const completeAssessment = async () => {
    setLoading(true);
    
    // Extract gender from screening answers
    const genderAnswer = chatHistory.find(h => h.question === 'gender')?.answer?.toLowerCase().trim();
    const ageAnswer = chatHistory.find(h => h.question === 'age')?.answer;
    const weightAnswer = chatHistory.find(h => h.question === 'weight')?.answer;
    
    // Combine donor data with screening answers
    const screeningData = {
      ...donorData,
      gender: genderAnswer,
      age: ageAnswer ? parseInt(ageAnswer) : donorData.age,
      weight: weightAnswer ? parseFloat(weightAnswer) : donorData.weight,
      screeningAnswers: chatHistory
    };

    try {
      const healthAssessment = assessDonorHealth(screeningData);
      setAssessment(healthAssessment);

      const resultMessage = {
        id: 'assessment_result',
        type: 'bot',
        content: getAssessmentMessage(healthAssessment),
        assessment: healthAssessment,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, resultMessage]);
    } catch (error) {
      console.error('Assessment error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssessmentMessage = (assessment) => {
    if (assessment.eligible) {
      const genderSpecific = assessment.gender === 'female' 
        ? " As a female donor, remember to maintain adequate iron levels and consider donating during the middle of your menstrual cycle for optimal results."
        : assessment.gender === 'male'
        ? " As a male donor, you can donate up to 6 times per year with proper spacing between donations."
        : "";
      
      return `Great news! Based on your answers, you appear eligible to donate blood.${genderSpecific} However, please consult with medical staff for final approval.`;
    } else {
      return `Based on your answers, there are some concerns that may affect your eligibility. Please review the recommendations below.`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleUserInput();
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'LOW': return 'success';
      case 'MEDIUM': return 'warning';
      case 'HIGH': return 'error';
      default: return 'default';
    }
  };

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'LOW': return <CheckIcon />;
      case 'MEDIUM': return <WarningIcon />;
      case 'HIGH': return <CancelIcon />;
      default: return <InfoIcon />;
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
          height: '80vh',
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
          <BotIcon />
        </Avatar>
        <Typography variant="h6">AI Health Screening Assistant</Typography>
        <IconButton
          onClick={onClose}
          sx={{ ml: 'auto' }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, display: 'flex', flexDirection: 'column' }}>
        {/* Chat Messages */}
        <Box sx={{ 
          flex: 1, 
          overflowY: 'auto', 
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 1
              }}
            >
              <Paper
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: message.type === 'user' 
                    ? 'primary.main' 
                    : message.isError 
                      ? 'error.light' 
                      : isDark ? '#333' : '#f5f5f5',
                  color: message.type === 'user' ? 'white' : 'inherit',
                  borderRadius: 2
                }}
              >
                <Typography variant="body1">
                  {message.content}
                </Typography>
                
                {message.assessment && (
                  <Box sx={{ mt: 2 }}>
                    <Chip
                      icon={getRiskIcon(message.assessment.overallRisk)}
                      label={`Risk Level: ${message.assessment.overallRisk}`}
                      color={getRiskColor(message.assessment.overallRisk)}
                      sx={{ mb: 1 }}
                    />
                    
                    {message.assessment.risks.length > 0 && (
                      <Alert severity="warning" sx={{ mb: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>Concerns:</Typography>
                        <List dense>
                          {message.assessment.risks.map((risk, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <WarningIcon fontSize="small" color="warning" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography component="span" variant="body2">
                                    {risk}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                    
                    {message.assessment.recommendations.length > 0 && (
                      <Alert severity="info">
                        <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                        <List dense>
                          {message.assessment.recommendations.map((rec, index) => (
                            <ListItem key={index} sx={{ py: 0 }}>
                              <ListItemIcon sx={{ minWidth: 30 }}>
                                <InfoIcon fontSize="small" color="info" />
                              </ListItemIcon>
                              <ListItemText 
                                primary={
                                  <Typography component="span" variant="body2">
                                    {rec}
                                  </Typography>
                                } 
                              />
                            </ListItem>
                          ))}
                        </List>
                      </Alert>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          ))}
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <Paper sx={{ p: 2, bgcolor: isDark ? '#333' : '#f5f5f5', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} />
                  <Typography>Analyzing your responses...</Typography>
                </Box>
              </Paper>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Input Area */}
        <Divider />
        <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            placeholder="Type your answer..."
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={loading || currentQuestion >= screeningQuestions.length}
            size="small"
          />
          <Button
            variant="contained"
            onClick={handleUserInput}
            disabled={!userInput.trim() || loading || currentQuestion >= screeningQuestions.length}
            endIcon={<SendIcon />}
          >
            Send
          </Button>
        </Box>
      </DialogContent>

      {assessment && (
        <DialogActions sx={{ p: 2, borderTop: isDark ? '1px solid #333' : '1px solid #e0e0e0' }}>
          <Button onClick={onClose}>Close</Button>
          <Button 
            variant="contained" 
            onClick={() => onComplete(assessment)}
            disabled={!assessment.eligible}
          >
            Continue to Appointment
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default HealthScreeningBot; 