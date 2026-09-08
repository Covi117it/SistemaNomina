using ClosedXML.Excel;

namespace backend.Services.Excel
{
    public static class ClosedXmlStyleExtensions
    {
        public static IXLRange ApplyHeaderStyle(this IXLRange range, string bgColor = "#0F172A", string fontColor = "#FFFFFF", double fontSize = 9.5)
        {
            range.Style.Font.Bold = true;
            range.Style.Font.FontSize = fontSize;
            range.Style.Font.FontColor = XLColor.FromHtml(fontColor);
            range.Style.Fill.BackgroundColor = XLColor.FromHtml(bgColor);
            range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            range.Style.Border.OutsideBorderColor = XLColor.FromHtml("#334155");
            return range;
        }

        public static IXLCell ApplyBadge(this IXLCell cell, bool isActivo)
        {
            cell.Style.Font.Bold = true;
            cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml(isActivo ? "#D1FAE5" : "#FEE2E2");
            cell.Style.Font.FontColor = XLColor.FromHtml(isActivo ? "#065F46" : "#991B1B");
            return cell;
        }
    }
}
