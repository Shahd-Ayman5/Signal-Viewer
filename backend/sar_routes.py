from flask import Blueprint, jsonify
import rasterio
import numpy as np
import base64
import io
import matplotlib
matplotlib.use('Agg')  
import matplotlib.pyplot as plt

sar_bp = Blueprint('sar', __name__)

# Use the hardcoded file paths
SAR_FILE_MINE = "uploads/Mine.tif"
SAR_FILE_ROTTERDAM = "uploads/rotterdam.tif"

@sar_bp.route('/analyze_sar', methods=['GET'])
def analyze_sar():
    
    try:
        # Process Mine image
        def processImg(SAR_FILE):
            with rasterio.open(SAR_FILE) as src:
                img = src.read(1)
                profile = src.profile
                return img, profile
     
        def calculate_statistics(img):
            return {
                "mean": float(np.mean(img)),
                "std": float(np.std(img)),
                "min": float(np.min(img)),
                "max": float(np.max(img))
            }
        
               

        img_mine, profile_mine = processImg(SAR_FILE_MINE)
        img_rotterdam, profile_rotterdam = processImg(SAR_FILE_ROTTERDAM)

        stats_mine = calculate_statistics(img_mine)
        
        # Calculate statistics for Rotterdam
        stats_rotterdam = calculate_statistics(img_rotterdam)

      
        # Generate images for Mine
        gray_img_mine = generate_image(img_mine, 'gray', 'Mine')
        color_img_mine = generate_image(img_mine, 'jet', 'Mine')
        histogram_img_mine = generate_histogram(img_mine, 'Mine')
        
        # Generate images for Rotterdam
        gray_img_rotterdam = generate_image(img_rotterdam, 'gray', 'Rotterdam')
        color_img_rotterdam = generate_image(img_rotterdam, 'jet', 'Rotterdam')
        histogram_img_rotterdam = generate_histogram(img_rotterdam, 'Rotterdam')
        
        return jsonify({
            "status": "success",
            "mine": {
                "metadata": {
                    "shape": img_mine.shape,
                    "crs": str(profile_mine.get("crs", "N/A")),
                    "dtype": str(profile_mine["dtype"])
                },
                "statistics": {
                    "mean":stats_mine["mean"],
                    "std": stats_mine["std"],
                    "min": stats_mine["min"],
                    "max": stats_mine["max"]
                },
                "images": {
                    "grayscale": gray_img_mine,
                    "colormap": color_img_mine,
                    "histogram": histogram_img_mine
                }
            },
            "rotterdam": {
                "metadata": {
                    "shape": img_rotterdam.shape,
                    "crs": str(profile_rotterdam.get("crs", "N/A")),
                    "dtype": str(profile_rotterdam["dtype"])
                },
                "statistics": {
                    "mean": stats_rotterdam["mean"],
                    "std": stats_rotterdam["std"],
                    "min": stats_rotterdam["min"],
                    "max": stats_rotterdam["max"]
                },
                "images": {
                    "grayscale": gray_img_rotterdam,
                    "colormap": color_img_rotterdam,
                    "histogram": histogram_img_rotterdam
                }
            },
        })
    
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

def generate_image(data, cmap, title):
    """Generate base64 encoded image"""
    fig, ax = plt.subplots(figsize=(8, 6))
    im = ax.imshow(data, cmap=cmap)
    plt.colorbar(im, ax=ax, label="Backscatter intensity")
    ax.set_title(f"SAR Image - {title} ({cmap})")
    ax.axis('off')
    
    # Save to bytes
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig)
    buf.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"

def generate_histogram(data, title):
    """Generate histogram as base64 encoded image"""
    fig, ax = plt.subplots(figsize=(7, 5))
    ax.hist(data.ravel(), bins=256, color="blue", alpha=0.7)
    ax.set_title(f"Histogram of SAR intensity - {title}")
    ax.set_xlabel("Pixel value")
    ax.set_ylabel("Count")
    ax.grid(True, alpha=0.3)
    
    # Save to bytes
    buf = io.BytesIO()
    plt.savefig(buf, format='png', bbox_inches='tight', dpi=100)
    plt.close(fig)
    buf.seek(0)
    
    # Encode to base64
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    return f"data:image/png;base64,{img_base64}"
