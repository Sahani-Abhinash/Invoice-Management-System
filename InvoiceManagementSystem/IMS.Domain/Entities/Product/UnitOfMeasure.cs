using IMS.Domain.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Domain.Entities.Product
{
    public class UnitOfMeasure : BaseEntity
    {
        public string Name { get; set; } = string.Empty;   // Piece, Kg
        public string Symbol { get; set; } = string.Empty; // pcs, kg
    }
}
