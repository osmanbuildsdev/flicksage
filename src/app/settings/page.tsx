'use client';

import React from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import Header from '@/components/Header';

const SettingsPage: React.FC = () => {
  return (
    <>
      <Header />
      <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)' }}>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h3" gutterBottom>
                Settings
              </Typography>
              <Typography variant="body1" color="text.secondary">
                App settings and preferences.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Coming soon...
              </Typography>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default SettingsPage;
