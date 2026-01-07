using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Application.Common
{
    public static class Permissions
    {
        public const string ManageUsers = "Users.Manage";
        public const string ViewUsers = "Users.View";
        public const string ViewInventory = "Inventory.View";
        public const string ManageInventory = "Inventory.Manage";
        public const string CreateInvoice = "Invoice.Create";
        public const string ViewInvoice = "Invoice.View";
        public const string PayInvoice = "Invoice.Pay";
        // Companies
        public const string ViewCompanies = "Companies.View";
        public const string ManageCompanies = "Companies.Manage";
        // Branches
        public const string ViewBranches = "Branches.View";
        public const string ManageBranches = "Branches.Manage";
        // Roles & Permissions
        public const string ManageRoles = "Roles.Manage";
        public const string ManagePermissions = "Permissions.Manage";
        // Products / Items
        public const string ViewItems = "Items.View";
        public const string ManageItems = "Items.Manage";
        // Product Properties
        public const string ViewProductProperties = "ProductProperties.View";
        public const string ManageProductProperties = "ProductProperties.Manage";
        // Property Attributes
        public const string ViewPropertyAttributes = "PropertyAttributes.View";
        public const string ManagePropertyAttributes = "PropertyAttributes.Manage";
        // Item Property Assignments
        public const string ViewItemPropertyAssignments = "ItemPropertyAssignments.View";
        public const string ManageItemPropertyAssignments = "ItemPropertyAssignments.Manage";
        // Warehouses & Stocks
        public const string ViewWarehouses = "Warehouses.View";
        public const string ManageWarehouses = "Warehouses.Manage";
        public const string ManageStocks = "Stocks.Manage";
        // Price lists
        public const string ManagePriceLists = "PriceLists.Manage";

        // Vendors (suppliers)
        public const string ViewVendors = "Vendors.View";
        public const string ManageVendors = "Vendors.Manage";

        // Customers
        public const string ViewCustomers = "Customers.View";
        public const string ManageCustomers = "Customers.Manage";

        // Purchase Orders
        public const string ViewPurchaseOrders = "PurchaseOrders.View";
        public const string ManagePurchaseOrders = "PurchaseOrders.Manage";
        public const string ApprovePurchaseOrders = "PurchaseOrders.Approve";
        public const string ClosePurchaseOrders = "PurchaseOrders.Close";

        // Goods Received Notes (GRN)
        public const string ViewGoodsReceivedNotes = "GoodsReceivedNotes.View";
        public const string ManageGoodsReceivedNotes = "GoodsReceivedNotes.Manage";
        public const string CreateGoodsReceivedNotes = "GoodsReceivedNotes.Create";
        public const string ReceiveGoodsReceivedNotes = "GoodsReceivedNotes.Receive";

        // Stock Transactions
        public const string ViewStockTransactions = "StockTransactions.View";
        public const string ManageStockTransactions = "StockTransactions.Manage";

        // ---------------------
        // Invoicing / Sales
        // ---------------------
        // Invoices
        public const string ViewInvoices = "Invoices.View";
        public const string ManageInvoices = "Invoices.Manage";
        public const string CreateInvoices = "Invoices.Create";
        public const string EditInvoices = "Invoices.Edit";
        public const string DeleteInvoices = "Invoices.Delete";

        // Invoice items (line-level permissions if needed)
        public const string ViewInvoiceItems = "InvoiceItems.View";
        public const string ManageInvoiceItems = "InvoiceItems.Manage";

        // Payments
        public const string ViewPayments = "Payments.View";
        public const string ManagePayments = "Payments.Manage";
        public const string CreatePayments = "Payments.Create";
        public const string RefundPayments = "Payments.Refund";

        // Geography
        public const string ViewCountries = "Countries.View";
        public const string ManageCountries = "Countries.Manage";
        public const string ViewStates = "States.View";
        public const string ManageStates = "States.Manage";
        public const string ViewCities = "Cities.View";
        public const string ManageCities = "Cities.Manage";
        public const string ViewPostalCodes = "PostalCodes.View";
        public const string ManagePostalCodes = "PostalCodes.Manage";

        // Currencies
        public const string ViewCurrencies = "Currencies.View";
        public const string ManageCurrencies = "Currencies.Manage";
    }
}
