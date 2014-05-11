# Require any additional compass plugins here.
require 'sass-css-importer' # sudo gem install --pre sass-css-importer

# Set this to the root of your project when deployed:
http_path = "./"
css_dir = "./public/css"
sass_dir = "./sass"
images_dir = "./public/img"
javascripts_dir = "./public/js"

# You can select your preferred output style here (can be overridden via the command line):
# output_style = :expanded or :nested or :compact or :compressed

# To compress css : compass compile -e production --force
output_style = (environment == :production) ? :compressed : :expanded
# output_style = :compressed

# To enable relative paths to assets via compass helper functions. Uncomment:
# relative_assets = true

# To disable debugging comments that display the original location of your selectors. Uncomment:
# line_comments = false


# If you prefer the indented syntax, you might want to regenerate this
# project again passing --syntax sass, or you can uncomment this:
# preferred_syntax = :sass
# and then run:
# sass-convert -R --from scss --to sass sass scss && rm -rf sass && mv scss sass
