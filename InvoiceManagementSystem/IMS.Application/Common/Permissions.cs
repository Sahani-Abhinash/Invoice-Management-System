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
        // Warehouses & Stocks
        public const string ViewWarehouses = "Warehouses.View";
        public const string ManageWarehouses = "Warehouses.Manage";
        public const string ManageStocks = "Stocks.Manage";
        // Price lists
        public const string ManagePriceLists = "PriceLists.Manage";

        // Geography
        public const string ViewCountries = "Countries.View";
        public const string ManageCountries = "Countries.Manage";
        public const string ViewStates = "States.View";
        public const string ManageStates = "States.Manage";
        public const string ViewCities = "Cities.View";
        public const string ManageCities = "Cities.Manage";
        public const string ViewPostalCodes = "PostalCodes.View";
        public const string ManagePostalCodes = "PostalCodes.Manage";
    }
}
