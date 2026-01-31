-- CertiChain Database Setup SQL
-- This file contains all necessary SQL commands to create the database tables

-- ========================================
-- 1. Institution Registrations Table
-- ========================================
-- Stores all institution registration requests
CREATE TABLE IF NOT EXISTS institution_registrations (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    website TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    wallet_address VARCHAR(42) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP,
    CONSTRAINT status_check CHECK (status IN ('pending', 'approved', 'rejected'))
);

-- Create index for faster lookups by wallet address
CREATE INDEX IF NOT EXISTS idx_wallet_address ON institution_registrations(wallet_address);

-- Create index for status filtering
CREATE INDEX IF NOT EXISTS idx_status ON institution_registrations(status);

-- ========================================
-- 2. Certificates Table (Optional - for tracking off-chain)
-- ========================================
-- This table is optional and used for tracking certificate issuance
-- The blockchain is the source of truth, but this helps with searching/filtering
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    token_id BIGINT NOT NULL UNIQUE,
    student_name_hash VARCHAR(66) NOT NULL,
    student_email_hash VARCHAR(66) NOT NULL,
    student_wallet VARCHAR(42) NOT NULL,
    course TEXT NOT NULL,
    enrollment_date TIMESTAMP NOT NULL,
    issuer_wallet VARCHAR(42) NOT NULL,
    institution_name TEXT,
    data_hash VARCHAR(66) NOT NULL,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revocation_reason TEXT,
    issued_at TIMESTAMP NOT NULL DEFAULT NOW(),
    revoked_at TIMESTAMP,
    transaction_hash VARCHAR(66) NOT NULL,
    CONSTRAINT fk_institution 
        FOREIGN KEY (issuer_wallet) 
        REFERENCES institution_registrations(wallet_address)
        ON DELETE RESTRICT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_student_wallet ON certificates(student_wallet);
CREATE INDEX IF NOT EXISTS idx_issuer_wallet ON certificates(issuer_wallet);
CREATE INDEX IF NOT EXISTS idx_token_id ON certificates(token_id);
CREATE INDEX IF NOT EXISTS idx_is_revoked ON certificates(is_revoked);
CREATE INDEX IF NOT EXISTS idx_transaction_hash ON certificates(transaction_hash);

-- ========================================
-- 3. Sample Data (Optional - for testing)
-- ========================================
-- Uncomment below to insert test data

-- INSERT INTO institution_registrations (name, email, website, location, description, wallet_address, status)
-- VALUES 
--     ('Global University of Technology', 'admin@globaltech.edu', 'https://globaltech.edu', 'New York, USA', 'Leading technology university', '0x1234567890123456789012345678901234567890', 'approved'),
--     ('Institute of Advanced Studies', 'contact@ias.edu', 'https://ias.edu', 'London, UK', 'Research-focused institution', '0x0987654321098765432109876543210987654321', 'pending');

-- ========================================
-- 4. Useful Queries
-- ========================================

-- Get all pending registrations
-- SELECT * FROM institution_registrations WHERE status = 'pending' ORDER BY created_at DESC;

-- Get all approved institutions
-- SELECT * FROM institution_registrations WHERE status = 'approved' ORDER BY name;

-- Count certificates by institution
-- SELECT 
--     ir.name, 
--     COUNT(c.id) as certificate_count 
-- FROM institution_registrations ir
-- LEFT JOIN certificates c ON ir.wallet_address = c.issuer_wallet
-- WHERE ir.status = 'approved'
-- GROUP BY ir.id, ir.name
-- ORDER BY certificate_count DESC;

-- Get certificates for a specific student
-- SELECT * FROM certificates WHERE student_wallet = '0x...' AND is_revoked = false;

-- Get recent certificates
-- SELECT * FROM certificates ORDER BY issued_at DESC LIMIT 10;
