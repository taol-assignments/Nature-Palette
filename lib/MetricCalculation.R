library(pavo)
library(rjson)

filePath <- commandArgs(trailingOnly = TRUE)[1]

spectra <- getspec(where = filePath, ext = 'Master.Transmission')

files = colnames(spectra)
files = files[files != "wl"]

errors <- vector(mode = "list")
warnings <- vector(mode = "list")

for (i in 1 : nrow(spectra)) {
    row <- spectra[i,]

    for (file in files) {
        full_name <- paste(file, '.Master.Transmission', sep = '')
        val = row[[file]]

        if (val >= - 2 && val <= 0) {
            warnings <- append(warnings, list(list(
                file = full_name,
                wavelen = row$wl,
                value = val)))
        } else if (val < - 2) {
            errors <- append(errors, list(list(
                file = full_name,
                wavelen = row$wl,
                value = val)))
        }
    }
}

cat(toJSON(list(
metrics = summary(spectra),
warnings = warnings,
errors = errors
)))
