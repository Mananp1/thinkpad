import { Alert, AlertTitle, Container, Typography } from "@mui/material";

const RateLimitedUI = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Alert severity="warning" variant="outlined">
        <AlertTitle sx={{ fontWeight: 700 }}>Rate limit Reached</AlertTitle>
        <Typography variant="body2">
          You have made too many requests in a short period. Please wait a
          moment.
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Try again in a few seconds for the best experience.
        </Typography>
      </Alert>
    </Container>
  );
};

export default RateLimitedUI;
