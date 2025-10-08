import { Box, Button, Card, CardContent, CardHeader, TextField } from "@material-ui/core";

export const LoginCard = () => (


    <Card style={{ maxWidth: 400, margin: 'auto', marginTop: '2rem', padding: '1rem' }}>
        <CardHeader title="Sign in" style={{ textAlign: 'center' }} />
        <CardContent>
            <TextField
                label="Username"
                variant="outlined"
                fullWidth
            />
            <br /><br />
            <TextField
                label="Password"
                variant="outlined"
                type="password"
                fullWidth
            />
            <br /><br />
            <Box textAlign="center">
                <Button variant="contained" color="primary">
                    Sign In
                </Button>
            </Box>
        </CardContent>
    </Card>

)