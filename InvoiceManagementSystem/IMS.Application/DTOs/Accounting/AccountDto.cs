using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Accounting
{
    public class AccountDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public string? CurrencyCode { get; set; }  // For display purposes
        public bool IsActive { get; set; } = true;
        public Guid? CompanyId { get; set; }  // Optional if single-company system
        public decimal CurrentBalance { get; set; }  // Calculated from GL
    }

    public class CreateAccountDto
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public Guid? CompanyId { get; set; }  // Optional if single-company system
    }

    public class UpdateAccountDto
    {
        public Guid Id { get; set; }
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public string Description { get; set; } = string.Empty;
        public decimal OpeningBalance { get; set; }
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public bool IsActive { get; set; } = true;
    }

    public class AccountBalanceDto
    {
        public Guid AccountId { get; set; }
        public string Code { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal DebitTotal { get; set; }
        public decimal CreditTotal { get; set; }
        public decimal Balance { get; set; }
    }
}

