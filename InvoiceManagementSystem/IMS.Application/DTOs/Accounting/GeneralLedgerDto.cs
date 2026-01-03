using System;
using IMS.Domain.Enums;

namespace IMS.Application.DTOs.Accounting
{
    public class GeneralLedgerDto
    {
        public Guid Id { get; set; }
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public GLSourceType SourceType { get; set; }
        public string SourceId { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public decimal Balance { get; set; }
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public string? CurrencyCode { get; set; }  // For display purposes
        public TransactionStatus Status { get; set; } = TransactionStatus.Posted;
        public string Remarks { get; set; } = string.Empty;
    }

    public class CreateGeneralLedgerDto
    {
        public Guid AccountId { get; set; }
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public GLSourceType SourceType { get; set; }
        public string SourceId { get; set; } = string.Empty;
        public string ReferenceNumber { get; set; } = string.Empty;
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public string Remarks { get; set; } = string.Empty;
    }

    public class GeneralLedgerFilterDto
    {
        public Guid? AccountId { get; set; }
        public GLSourceType? SourceType { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
        public TransactionStatus? Status { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 100;
    }

    public class GeneralLedgerSummaryDto
    {
        public Guid AccountId { get; set; }
        public string AccountCode { get; set; } = string.Empty;
        public string AccountName { get; set; } = string.Empty;
        public AccountType AccountType { get; set; }
        public decimal OpeningBalance { get; set; }
        public decimal TotalDebits { get; set; }
        public decimal TotalCredits { get; set; }
        public decimal ClosingBalance { get; set; }
    }

    public class JournalEntryDto
    {
        public DateTime TransactionDate { get; set; }
        public string Description { get; set; } = string.Empty;
        public GLSourceType SourceType { get; set; }
        public string SourceId { get; set; } = string.Empty;
        public Guid? CompanyId { get; set; }  // Optional if single-company
        public Guid? CurrencyId { get; set; }  // FK to Currency master
        public TransactionStatus Status { get; set; } = TransactionStatus.Posted;
        public List<JournalEntryLineDto> Lines { get; set; } = new();
    }

    public class JournalEntryLineDto
    {
        public Guid AccountId { get; set; }
        public decimal DebitAmount { get; set; }
        public decimal CreditAmount { get; set; }
        public string Description { get; set; } = string.Empty;
    }
}
