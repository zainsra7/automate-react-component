#!/bin/bash
declare -a file_list
import_react="import React from 'react'"
split_component_name(){
    IFS='-'
    read -ra component_name_array <<< "$1"
    index=0
    for i in "${component_name_array[@]}"; do # access each element of array
        if [ $index != 0 ]; then 
            component_name_array[$index]="$(tr '[:lower:]' '[:upper:]' <<< ${i:0:1})${i:1}"
        fi
        index=$((index + 1))
    done
    IFS=' '
    camelCase_component_name=$( IFS=$''; echo "${component_name_array[*]}" )
}
get_component_file_data(){
    import_component_styles="import { ${camelCase_component_name//-}Styles } from './$1.styles';"
    export_component="export const ${camelCase_component_name//-} = (Props) => {};"
    interface_props="interface Props{}"
component_file_data="$(cat <<-EOF
$import_react
$import_component_styles

$interface_props

$export_component    
EOF
)"
}
get_component_styles_data(){
    import_makeStyles="import { makeStyles } from '@material-ui/core';"
    import_colors="import { COLOURS } from '../../../utils/constants';"
    export_component_style="export const ${camelCase_component_name}Styles = makeStyles(() => ({}));"
component_style_data="$(cat <<-EOF
$import_makeStyles
$import_colors

$export_component_style
EOF
)"
}
get_component_test_data(){
    import_jestDom="import 'jest-dom/extend-expect';"
    import_cleanup_wait="import { cleanup, wait } from '@testing-library/react';"
    import_renderWithRouter="import { renderWithRouter } from '../../../../test/utils/render-with-router';"
    describe_test="describe('$camelCase_component_name test', () => {});"
component_test_data="$(cat <<-EOF
$import_react
$import_jestDom
$import_cleanup_wait
$import_renderWithRouter

$describe_test
EOF
)"
}
if [ "$#" == 2 ]; then
    if [ -d "$1" ]; then
        split_component_name $2       
        file_list=("$2.styles.ts" "$2.fixtures.ts" "$2.tsx" "$2.test.tsx" "index.ts")
        component_directory=$1/$2
        mkdir -p $component_directory
        for i in "${file_list[@]}"; do touch $component_directory/$i; done
        get_component_file_data $2
        echo $component_file_data >> $component_directory/$2.tsx

        get_component_styles_data
        echo $component_style_data >> $component_directory/$2.styles.ts

        get_component_test_data
        echo $component_test_data >> $component_directory/$2.test.tsx

        echo "export * from './$2'" >> $component_directory/index.ts
    else
        echo "Please specify relevant component category (atom/molecules/organisms)"
    fi
else
    printf "\nInvalid syntax! Please use the following syntax:\n
    bash create-component.sh <atoms/molecules/organisms> <Component Name>\n 
    Ex: bash create-component.sh atoms squad-card\n
    will create squad-card in atoms directory:\n
    ../atoms/squad-card/index.ts
    ../atoms/squad-card/squad-card.tsx
    ../atoms/squad-card/squad-card.styles.ts
    ../atoms/squad-card/squad-card.test.tsx
    ../atoms/squad-card/squad-card.fixures.ts\n"
fi