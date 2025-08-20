#!/usr/bin/env node

/**
 * Environment Configuration Validator
 * 
 * This script validates that all required environment variables are set
 * and provides helpful error messages for missing or invalid configurations.
 */

const fs = require('fs');
const path = require('path');

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  bold: '\x1b[1m'
};

// Required environment variables
const requiredVars = {
  NODE_ENV: {
    required: true,
    values: ['development', 'staging', 'production'],
    description: 'Application environment'
  },
  PORT: {
    required: true,
    type: 'number',
    description: 'Server port number'
  },
  DATABASE_URL: {
    required: true,
    pattern: /^postgresql:\/\/.+/,
    description: 'PostgreSQL connection string'
  },
  JWT_SECRET: {
    required: true,
    minLength: 32,
    description: 'JWT signing secret (minimum 32 characters)'
  },
  JWT_REFRESH_SECRET: {
    required: true,
    minLength: 32,
    description: 'JWT refresh token secret (minimum 32 characters)'
  }
};

// Optional environment variables with defaults
const optionalVars = {
  API_PREFIX: { default: 'api/v1' },
  JWT_EXPIRES_IN: { default: '15m' },
  JWT_REFRESH_EXPIRES_IN: { default: '7d' },
  THROTTLE_TTL: { default: '60', type: 'number' },
  THROTTLE_LIMIT: { default: '100', type: 'number' },
  LOG_LEVEL: { default: 'info', values: ['error', 'warn', 'info', 'debug'] },
  BCRYPT_ROUNDS: { default: '12', type: 'number' }
};

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.error(`${colors.red}${colors.bold}Error:${colors.reset} .env file not found!`);
    console.log(`${colors.yellow}Please copy .env.example to .env and configure it.${colors.reset}`);
    console.log(`${colors.blue}Command: cp .env.example .env${colors.reset}`);
    process.exit(1);
  }

  // Load .env file manually (simple implementation)
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        let value = valueParts.join('=');
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        envVars[key] = value;
      }
    }
  });

  return envVars;
}

function validateVariable(name, config, value) {
  const errors = [];

  // Check if required and missing
  if (config.required && (!value || value.trim() === '')) {
    errors.push(`Required variable '${name}' is missing or empty`);
    return errors;
  }

  // Skip validation if optional and not provided
  if (!config.required && (!value || value.trim() === '')) {
    return errors;
  }

  // Type validation
  if (config.type === 'number') {
    if (isNaN(Number(value))) {
      errors.push(`'${name}' must be a valid number, got: ${value}`);
    }
  }

  // Pattern validation
  if (config.pattern && !config.pattern.test(value)) {
    errors.push(`'${name}' format is invalid: ${value}`);
  }

  // Allowed values validation
  if (config.values && !config.values.includes(value)) {
    errors.push(`'${name}' must be one of: ${config.values.join(', ')}, got: ${value}`);
  }

  // Minimum length validation
  if (config.minLength && value.length < config.minLength) {
    errors.push(`'${name}' must be at least ${config.minLength} characters long`);
  }

  return errors;
}

function validateEnvironment() {
  console.log(`${colors.blue}${colors.bold}🔍 Validating Environment Configuration...${colors.reset}\n`);

  const envVars = loadEnvFile();
  const errors = [];
  const warnings = [];

  // Validate required variables
  console.log(`${colors.bold}Required Variables:${colors.reset}`);
  for (const [name, config] of Object.entries(requiredVars)) {
    const value = envVars[name];
    const validationErrors = validateVariable(name, config, value);
    
    if (validationErrors.length > 0) {
      console.log(`  ${colors.red}✗${colors.reset} ${name}: ${colors.red}${validationErrors[0]}${colors.reset}`);
      errors.push(...validationErrors);
    } else {
      console.log(`  ${colors.green}✓${colors.reset} ${name}: ${colors.green}Valid${colors.reset}`);
    }
  }

  // Validate optional variables
  console.log(`\n${colors.bold}Optional Variables:${colors.reset}`);
  for (const [name, config] of Object.entries(optionalVars)) {
    const value = envVars[name];
    const validationErrors = validateVariable(name, config, value);
    
    if (validationErrors.length > 0) {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${name}: ${colors.yellow}${validationErrors[0]}${colors.reset}`);
      warnings.push(...validationErrors);
    } else if (value) {
      console.log(`  ${colors.green}✓${colors.reset} ${name}: ${colors.green}${value}${colors.reset}`);
    } else if (config.default) {
      console.log(`  ${colors.blue}ℹ${colors.reset} ${name}: ${colors.blue}Using default (${config.default})${colors.reset}`);
    }
  }

  // Security checks
  console.log(`\n${colors.bold}Security Checks:${colors.reset}`);
  
  // Check for weak JWT secrets
  const jwtSecret = envVars.JWT_SECRET;
  const jwtRefreshSecret = envVars.JWT_REFRESH_SECRET;
  
  if (jwtSecret && (jwtSecret.includes('secret') || jwtSecret.includes('change') || jwtSecret.length < 32)) {
    warnings.push('JWT_SECRET appears to be using default/weak value');
    console.log(`  ${colors.yellow}⚠${colors.reset} JWT_SECRET: ${colors.yellow}Appears to be weak or default${colors.reset}`);
  } else if (jwtSecret) {
    console.log(`  ${colors.green}✓${colors.reset} JWT_SECRET: ${colors.green}Appears secure${colors.reset}`);
  }

  if (jwtRefreshSecret && (jwtRefreshSecret.includes('secret') || jwtRefreshSecret.includes('change') || jwtRefreshSecret.length < 32)) {
    warnings.push('JWT_REFRESH_SECRET appears to be using default/weak value');
    console.log(`  ${colors.yellow}⚠${colors.reset} JWT_REFRESH_SECRET: ${colors.yellow}Appears to be weak or default${colors.reset}`);
  } else if (jwtRefreshSecret) {
    console.log(`  ${colors.green}✓${colors.reset} JWT_REFRESH_SECRET: ${colors.green}Appears secure${colors.reset}`);
  }

  // Production environment checks
  if (envVars.NODE_ENV === 'production') {
    console.log(`\n${colors.bold}Production Environment Checks:${colors.reset}`);
    
    if (envVars.LOG_LEVEL === 'debug') {
      warnings.push('LOG_LEVEL should not be "debug" in production');
      console.log(`  ${colors.yellow}⚠${colors.reset} LOG_LEVEL: ${colors.yellow}Should not be "debug" in production${colors.reset}`);
    }
    
    if (envVars.SWAGGER_ENABLED === 'true') {
      warnings.push('SWAGGER_ENABLED should be false in production');
      console.log(`  ${colors.yellow}⚠${colors.reset} SWAGGER_ENABLED: ${colors.yellow}Should be false in production${colors.reset}`);
    }
  }

  // Summary
  console.log(`\n${colors.bold}Validation Summary:${colors.reset}`);
  
  if (errors.length === 0) {
    console.log(`${colors.green}✓ All required configurations are valid!${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ ${errors.length} error(s) found:${colors.reset}`);
    errors.forEach(error => console.log(`  - ${error}`));
  }

  if (warnings.length > 0) {
    console.log(`${colors.yellow}⚠ ${warnings.length} warning(s):${colors.reset}`);
    warnings.forEach(warning => console.log(`  - ${warning}`));
  }

  console.log('');

  if (errors.length > 0) {
    console.log(`${colors.red}${colors.bold}❌ Environment validation failed!${colors.reset}`);
    console.log(`${colors.yellow}Please fix the errors above before starting the application.${colors.reset}`);
    console.log(`${colors.blue}See docs/environment-configuration.md for detailed configuration guide.${colors.reset}`);
    process.exit(1);
  } else if (warnings.length > 0) {
    console.log(`${colors.yellow}${colors.bold}⚠️  Environment validation passed with warnings!${colors.reset}`);
    console.log(`${colors.yellow}Consider addressing the warnings above for better security/performance.${colors.reset}`);
  } else {
    console.log(`${colors.green}${colors.bold}✅ Environment validation passed!${colors.reset}`);
  }
}

// Run validation if called directly
if (require.main === module) {
  validateEnvironment();
}

module.exports = { validateEnvironment };
