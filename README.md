

# Ubiaj proces na portovima:

# Port 3000 (HTTP development):
kill $(lsof -ti:3000)
kill $(lsof -ti:4000)

# Port 3443 (HTTPS development):
kill $(lsof -ti:3443)

# Ili ručno ubiaj proces:
lsof -xi:3000  # vidi koji proces koristi port 3000
lsof -xi:3443  # vidi koji proces koristi port 3443
kill <PID>     # ubiaj taj proces

# Development serveri:
npm run dev        # HTTP na portu 3000 (preporučeno)
npm run dev:https  # HTTPS na portu 3443 (ako HTTP ne radi za Stripe)


