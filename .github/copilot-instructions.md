# AutoChart Development Instructions

## Project Overview

AutoChart is a chatbot application designed to help UHO customers determine whether there have been updates to their currently owned geospatial navigation paper charts. The application compares old chart versions with newly released charts in shapefile (.shp) format and recommends chart upgrades when polygon changes are detected.

## Problem Statement

UKHO customers currently lack a tool to determine if updates exist for their owned geospatial navigation paper charts. This project addresses that gap by providing automated comparison and upgrade recommendations.

## Technology Stack

- **Python Runtime**: UV Python (uv)
- **Geospatial Processing**: Geopandas, Pandas
- **Development Environment**: Jupyter Notebook
- **Data Format**: Shapefiles (.shp, .dbf, .prj, .shx, .cpg, .sbn, .sbx)
- **GIS Tools**: QGIS (for validation and visualization)

## Project Structure

```
AutoChart/
├── src/
│   └── autochart/
│       └── __init__.py          # Main package initialization
├── data/
│   ├── Old_Chart_Scheme.*       # Old chart shapefiles
│   └── New_Chart_Scheme.*       # New chart shapefiles
├── notebook.ipynb               # Jupyter notebook for analysis
├── pyproject.toml              # UV project configuration
└── README.md                   # Project documentation
```

## Key Functionality

### Shapefile Processing

- Load and parse both old and new chart shapefiles using `geopandas.read_file()`
- Pass file paths directly to `geopandas.read_file()`, not to `geodatasets.get_path()`
- Example: `gdf = geopandas.read_file(r"data\New_Chart_Scheme.shp")`

### Polygon Comparison

- Detect changes in polygon geometries between chart versions
- Identify added, removed, or modified polygons
- Generate comparison reports for customer recommendations

### Data Handling

- Work with Geopandas GeoDataFrames for spatial analysis
- Use Pandas for tabular data manipulation
- Export results in formats suitable for customer communication

## Development Guidelines

### Code Style

- Use meaningful variable names (e.g., `gdf_old`, `gdf_new` for GeoDataFrames)
- Comment spatial operations that perform geometric comparisons
- Keep analysis logic modular and testable

### Jupyter Notebook Usage

- Use the notebook for exploratory analysis and prototyping
- Organize cells by functional areas (imports, data loading, analysis, visualization)
- Move reusable code to `src/autochart/` modules

### Dependencies

- Manage dependencies through `pyproject.toml` with UV
- Key packages: geopandas, pandas, shapely
- Use `uv add` to add new dependencies

## Common Tasks

### Loading Chart Data

```python
import geopandas

# Load old chart
gdf_old = geopandas.read_file(r"data\Old_Chart_Scheme.shp")

# Load new chart
gdf_new = geopandas.read_file(r"data\New_Chart_Scheme.shp")
```

### Comparing Geometries

- Use geopandas spatial operations (intersects, difference, union)
- Compare geometry columns for added/removed/modified features
- Generate summary statistics on changes

### Visualization

- Use geopandas plotting for spatial visualization
- Leverage QGIS for validation and detailed inspection
- Create reports showing changes for customer recommendations

## Testing & Validation

- Test with both Old_Chart_Scheme and New_Chart_Scheme data
- Validate results in QGIS before customer delivery
- Ensure polygon changes are accurately detected and reported

## Coding Standards & Policies

Follow the UKHO software engineering policies throughout development:

### Language-Specific Standards

- **Python Coding Standards**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/CodingStandards/PythonCodingStandards.md
- **CSS Coding Standards**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/CodingStandards/CssCodingStandards.md
- **.NET Coding Standards**: https://github.com/dotnet/runtime/blob/main/docs/coding-guidelines/coding-style.md
- **HTML Coding Standards**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/CodingStandards/HtmlCodingStandards.md
- **JavaScript Coding Standards**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/CodingStandards/JavascriptCodingStandards.md

### Development Practices & Tools

- **Code Generation Tools Policy**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/CodeGenerationTools/CodeGenerationToolsPolicy.md
- **Unit Testing Policy**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/UnitTesting/UnitTestingPolicy.md
- **Frontend Policy**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/FrontEnd/FrontEndPolicy.md

### Infrastructure & Deployment

- **Container Best Practices**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/Containers/ContainerBestPractices.md
- **Container Policy**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/Containers/ContainerPolicy.md
- **Terraform Infrastructure as Code**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/InfrastructureAsCode/terraform.md
- **Pipeline Policy**: https://github.com/UKHO/docs/blob/main/software-engineering-policies/InfrastructureAsCode/terraform.md

## Notes

- Shapefiles consist of multiple related files (.shp, .dbf, .shx, .prj, etc.) — always keep them together
- Coordinate reference systems (CRS) may differ between old and new charts; handle transformations as needed
- Performance considerations: work with spatial indexing for large chart datasets
