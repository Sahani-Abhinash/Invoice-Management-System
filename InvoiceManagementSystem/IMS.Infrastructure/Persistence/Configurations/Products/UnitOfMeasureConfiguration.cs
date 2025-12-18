using IMS.Domain.Entities.Product;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence.Configurations.Products
{
    public class UnitOfMeasureConfiguration : IEntityTypeConfiguration<UnitOfMeasure>
    {
        public void Configure(EntityTypeBuilder<UnitOfMeasure> builder)
        {
            //builder.ToTable("UnitOfMeasures");
            //builder.HasKey(u => u.Id);

            //builder.Property(u => u.Name).IsRequired().HasMaxLength(50);
            //builder.Property(u => u.Symbol).IsRequired().HasMaxLength(10);

            //builder.HasData(
            //    new UnitOfMeasure { Id = Guid.Parse("uom1-0000-0000-0000-000000000001"), Name = "Piece", Symbol = "pcs" },
            //    new UnitOfMeasure { Id = Guid.Parse("uom2-0000-0000-0000-000000000002"), Name = "Kilogram", Symbol = "kg" }
            //);
        }
    }
}