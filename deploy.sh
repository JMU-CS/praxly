# Deployment was previously automated using GitHub Actions (see archive/deploy.yml).
# Starting with Praxly2, deployment is performed manually to allow multiple versions
# to be deployed to the same website (hosted on a JMU server) under different paths.

npm run build
rsync -vcaOz --chown=:praxly --delete dist/ w3:/data/praxly/

# -v, --verbose               increase verbosity
# -c, --checksum              skip based on checksum, not mod-time & size
# -a, --archive               archive mode; equals -rlptgoD (no -H,-A,-X)
#     -r, --recursive             recurse into directories
#     -l, --links                 copy symlinks as symlinks
#     -p, --perms                 preserve permissions
#     -t, --times                 preserve modification times
#     -g, --group                 preserve group
#     -o, --owner                 preserve owner (super-user only)
#     -D                          preserve special files
#     ======
#     -H, --hard-links            preserve hard links
#     -A, --acls                  preserve ACLs (implies -p)
#     -X, --xattrs                preserve extended attributes
# -O, --omit-dir-times        omit directories from --times
# -z, --compress              compress file data during the transfer
#     --chown=USER:GROUP      simple username/groupname mapping
#     --delete                delete extraneous files from dest dirs
