using IMS.Domain.Entities.Pricing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IMS.Infrastructure.Persistence.Configurations.Pricing
{
    public class PriceListConfiguration : IEntityTypeConfiguration<PriceList>
    {
        public void Configure(EntityTypeBuilder<PriceList> builder)
        {
            //builder.ToTable("PriceLists");
            //builder.HasKey(p => p.Id);

            //builder.Property(p => p.Name).IsRequired().HasMaxLength(50);

            //builder.HasData(
            //    new PriceList { Id = Guid.Parse("price1-0000-0000-0000-000000000001"), Name = "Retail", IsDefault = true },
            //    new PriceList { Id = Guid.Parse("price2-0000-0000-0000-000000000002"), Name = "Wholesale", IsDefault = false }
            //);
        }
    }
}
