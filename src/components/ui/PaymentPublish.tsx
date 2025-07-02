'use client'

import React, { useState } from 'react'
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Button,
    Typography,
    Box,
    Divider,
    CircularProgress,
    Card,
    CardContent,
    Alert,
    useTheme,
    useMediaQuery,
    IconButton,
    Grid
} from '@mui/material'
import {
    Payment as PaymentIcon,
    Security as SecurityIcon,
    Close as CloseIcon,
    EmojiEvents as PrizeIcon,
    Receipt as ReceiptIcon,
    CreditCard as CardIcon
} from '@mui/icons-material'
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PublishPaymentDialogProps {
    open: boolean
    onClose: () => void
    prizePool: number
    hackathonTitle: string
    onPaymentSuccess: () => void
}

const PaymentForm: React.FC<{
    hackathonTitle: string
    prizePool: number
    onPaymentSuccess: () => void
    onClose: () => void
}> = ({ hackathonTitle, prizePool, onPaymentSuccess, onClose }) => {
    const stripe = useStripe()
    const elements = useElements()
    const [processing, setProcessing] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const platformFee = Math.round(prizePool * 0.1 * 100) / 100 // 10% platform fee
    const totalAmount = platformFee

    // If no prize pool, show free publishing message
    if (!prizePool || prizePool === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <PrizeIcon color="success" sx={{ fontSize: 64, mb: 2 }} />
                <Typography variant="h6" gutterBottom color="success.main">
                    Free Publishing Available!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Since your hackathon has no prize pool, publishing is completely free.
                </Typography>
                <Button
                    variant="contained"
                    color="success"
                    onClick={() => {
                        onPaymentSuccess()
                        onClose()
                    }}
                    size="large"
                >
                    Publish for Free
                </Button>
            </Box>
        )
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount)
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()

        if (!stripe || !elements) {
            return
        }

        setProcessing(true)
        setError(null)

        const cardElement = elements.getElement(CardElement)

        if (!cardElement) {
            setError('Card information is required')
            setProcessing(false)
            return
        }

        try {
            // Create payment intent
            const response = await fetch('/api/payment/create-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: totalAmount * 100, // Convert to cents
                    hackathonTitle,
                    prizePool
                }),
            })

            const { clientSecret, error: backendError } = await response.json()

            if (backendError) {
                setError(backendError)
                setProcessing(false)
                return
            }

            // Confirm payment
            const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
                clientSecret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {
                            name: 'Hackathon Organizer',
                        },
                    },
                }
            )

            if (stripeError) {
                setError(stripeError.message || 'Payment failed')
                setProcessing(false)
            } else if (paymentIntent?.status === 'succeeded') {
                onPaymentSuccess()
                onClose()
            }
        } catch (error) {
            console.error('Payment error:', error)
            setError('An unexpected error occurred')
            setProcessing(false)
        }
    }

    return (
        <Box component="form" onSubmit={handleSubmit} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
            <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Publishing: <strong>{hackathonTitle}</strong>
                </Typography>
            </Box>

            {/* Payment Summary - Compact */}
            <Card sx={{ mb: 2, bgcolor: 'grey.50' }}>
                <CardContent sx={{ p: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={8}>
                            <Typography variant="body2" color="text.secondary">
                                Prize Pool: {formatCurrency(prizePool)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Platform Fee (10%): {formatCurrency(platformFee)}
                            </Typography>
                        </Grid>
                        <Grid item xs={4} sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight="bold" color="primary">
                                {formatCurrency(totalAmount)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Total Due
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

            {/* Payment Method - Compact */}
            <Box sx={{ mb: 2, flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CardIcon color="primary" fontSize="small" />
                    <Typography variant="subtitle2" fontWeight="bold">
                        Payment Method
                    </Typography>
                </Box>
                
                <Card sx={{ p: 2 }}>
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                            },
                        }}
                    />
                </Card>
            </Box>

            {/* Security Notice - Compact */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, p: 1.5, bgcolor: 'success.50', borderRadius: 1 }}>
                <SecurityIcon color="success" fontSize="small" />
                <Typography variant="caption" color="success.main">
                    Secure & encrypted payment
                </Typography>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
                <Button
                    onClick={onClose}
                    disabled={processing}
                    variant="outlined"
                    size="small"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!stripe || processing}
                    startIcon={processing ? <CircularProgress size={16} /> : <PaymentIcon />}
                    size="small"
                    sx={{ minWidth: 120 }}
                >
                    {processing ? 'Processing...' : `Pay ${formatCurrency(totalAmount)}`}
                </Button>
            </Box>
        </Box>
    )
}

export default function PublishPaymentDialog({
    open,
    onClose,
    prizePool,
    hackathonTitle,
    onPaymentSuccess
}: PublishPaymentDialogProps) {
    const theme = useTheme()
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
    const isTablet = useMediaQuery(theme.breakpoints.down('md'))

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{
                sx: {
                    borderRadius: fullScreen ? 0 : 2,
                    height: fullScreen ? '100vh' : 'auto',
                    maxHeight: fullScreen ? '100vh' : '85vh',
                    m: fullScreen ? 0 : 1,
                    overflow: 'hidden'
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                pb: 1,
                borderBottom: '1px solid',
                borderColor: 'divider'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PrizeIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight="bold">
                        Publish Hackathon
                    </Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent sx={{ 
                px: 2, 
                py: 2, 
                height: fullScreen ? 'calc(100vh - 120px)' : 'auto',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Elements stripe={stripePromise}>
                    <PaymentForm
                        hackathonTitle={hackathonTitle}
                        prizePool={prizePool}
                        onPaymentSuccess={onPaymentSuccess}
                        onClose={onClose}
                    />
                </Elements>
            </DialogContent>
        </Dialog>
    )
}