CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table to hold OAuth PKCE state and verifier temporarily (expires after use)
CREATE TABLE IF NOT EXISTS oauth_pkce_states (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    state TEXT NOT NULL UNIQUE,
    code_verifier TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_oauth_pkce_states_state ON oauth_pkce_states(state);

-- Main wearable connection table
CREATE TABLE IF NOT EXISTS wearable_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    wearable_type VARCHAR(50) NOT NULL,
    wearable_user_id TEXT NOT NULL,
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    access_token_expires_at TIMESTAMPTZ NOT NULL,
    refresh_token_expires_at TIMESTAMPTZ,
    scopes TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT wearable_type_valid CHECK (wearable_type IN ('garmin','whoop','muse')),
    CONSTRAINT wearable_connections_unique UNIQUE(user_id, wearable_type)
);

CREATE TABLE IF NOT EXISTS wearable_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    connection_id UUID NOT NULL REFERENCES wearable_connections(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    value NUMERIC NOT NULL,
    unit VARCHAR(20),
    timestamp TIMESTAMPTZ NOT NULL,
    source VARCHAR NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT source_valid CHECK (source IN ('garmin','whoop','muse'))
);

CREATE INDEX IF NOT EXISTS idx_wearable_data_connection_id ON wearable_data(connection_id);
CREATE INDEX IF NOT EXISTS idx_wearable_data_timestamp ON wearable_data(timestamp);

-- Trigger to update updated_at on wearable_connections
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_updated_at ON wearable_connections;
CREATE TRIGGER trg_set_updated_at
BEFORE UPDATE ON wearable_connections
FOR EACH ROW EXECUTE FUNCTION set_updated_at(); 