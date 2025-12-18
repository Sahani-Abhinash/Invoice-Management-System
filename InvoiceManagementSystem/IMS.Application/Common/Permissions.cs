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
        public const string ViewInventory = "Inventory.View";
        public const string ManageInventory = "Inventory.Manage";
        public const string CreateInvoice = "Invoice.Create";
        public const string ViewInvoice = "Invoice.View";
        public const string PayInvoice = "Invoice.Pay";
    }
}
